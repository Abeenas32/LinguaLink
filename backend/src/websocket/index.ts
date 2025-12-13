// src/websocket/index.ts
import WebSocket, { WebSocketServer } from "ws";
import { MessageService } from "../services/message.service";
import { roomService } from "../services/chat.service";
import { verifyToken as verifyJWT } from "../utils/jwt"; // Import your utility

interface AuthPayload {
  userId: string;
  email: string;
}

interface ExtendedWebSocket extends WebSocket {
  userId?: string;
  roomId?: string;
  isAlive?: boolean;
}

export function initWebSocket(server: any) {
  const wss = new WebSocketServer({
    server,
    path: "/chat",
  });

  console.log("🔌 WebSocket server initialized at /chat");

  // Heartbeat to detect dead connections
  const heartbeat = setInterval(() => {
    wss.clients.forEach((ws) => {
      const extWs = ws as ExtendedWebSocket;
      if (extWs.isAlive === false) {
        console.log("💀 Terminating dead connection");
        return extWs.terminate();
      }
      extWs.isAlive = false;
      extWs.ping();
    });
  }, 30000);

  wss.on("close", () => {
    clearInterval(heartbeat);
  });

  wss.on("connection", async (socket: ExtendedWebSocket, req) => {
    socket.isAlive = true;

    socket.on("pong", () => {
      socket.isAlive = true;
    });

    console.log("🔗 New WebSocket connection attempt");

    try {
      const url = new URL(req.url!, `http://${req.headers.host}`);
      const token = url.searchParams.get("token");

      if (!token) {
        socket.send(JSON.stringify({
          type: "error",
          message: "Unauthorized: Missing token",
          code: "AUTH_MISSING_TOKEN"
        }));
        return socket.close(4001, "Unauthorized");
      }

      // Verify JWT using your utility function
      const decoded = verifyJWT(token);
      
      if (!decoded || !decoded.userId) {
        socket.send(JSON.stringify({
          type: "error",
          message: "Invalid or expired token",
          code: "AUTH_INVALID_TOKEN"
        }));
        return socket.close(4001, "Unauthorized");
      }

      socket.userId = decoded.userId; // Use userId instead of id
      console.log("✅ User authenticated:", decoded.userId);

      // Send connection success
      socket.send(JSON.stringify({
        type: "connected",
        message: "Successfully connected",
        userId: decoded.userId
      }));

    } catch (error: any) {
      console.error("❌ Connection error:", error);
      socket.send(JSON.stringify({
        type: "error",
        message: error.message,
        code: "CONNECTION_ERROR"
      }));
      return socket.close(4000, "Connection error");
    }

    // Handle incoming messages
    socket.on("message", async (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        const userId = socket.userId;

        if (!userId) {
          return socket.send(JSON.stringify({
            type: "error",
            message: "Unauthorized",
            code: "AUTH_REQUIRED"
          }));
        }

        console.log(`📨 Message from ${userId}:`, msg.type);

        // JOIN ROOM
        if (msg.type === "join-room") {
          if (!msg.roomId) {
            return socket.send(JSON.stringify({
              type: "error",
              message: "roomId is required",
              code: "MISSING_ROOM_ID"
            }));
          }

          // Verify user has access to this room
          const accessCheck = await roomService.verifyUserAccess(userId, msg.roomId);
          
          if (!accessCheck.success || !accessCheck.hasAccess) {
            return socket.send(JSON.stringify({
              type: "error",
              message: "You don't have access to this room",
              code: "ACCESS_DENIED"
            }));
          }

          // Get room details
          const roomResult = await roomService.getRoom(msg.roomId);
          
          if (!roomResult.success) {
            return socket.send(JSON.stringify({
              type: "error",
              message: roomResult.error || "Room not found",
              code: "ROOM_NOT_FOUND"
            }));
          }

          socket.roomId = msg.roomId;
          console.log(`✅ User ${userId} joined room ${msg.roomId}`);

          return socket.send(JSON.stringify({
            type: "joined-room",
            roomId: msg.roomId,
            room: roomResult.room
          }));
        }

        // SEND MESSAGE
        if (msg.type === "send-message") {
          if (!msg.text || !msg.roomId) {
            return socket.send(JSON.stringify({
              type: "error",
              message: "text and roomId are required",
              code: "MISSING_FIELDS"
            }));
          }

          // Verify user is in the room
          const accessCheck = await roomService.verifyUserAccess(userId, msg.roomId);
          
          if (!accessCheck.success || !accessCheck.hasAccess) {
            return socket.send(JSON.stringify({
              type: "error",
              message: "You are not a member of this room",
              code: "NOT_ROOM_MEMBER"
            }));
          }

          const saved = await MessageService.createMessage(
            msg.roomId,
            userId,
            msg.text
          );

          if (!saved.success) {
            return socket.send(JSON.stringify({
              type: "error",
              message: saved.message,
              code: "MESSAGE_SAVE_FAILED"
            }));
          }

          console.log(`Message saved in room ${msg.roomId}`);

          // Broadcast to all users in the same room
          let broadcastCount = 0;
          wss.clients.forEach((client) => {
            const extClient = client as ExtendedWebSocket;
            if (
              extClient.roomId === msg.roomId &&
              extClient.readyState === WebSocket.OPEN
            ) {
              extClient.send(JSON.stringify({
                type: "new-message",
                message: saved.data
              }));
              broadcastCount++;
            }
          });

          console.log(`Broadcasted to ${broadcastCount} clients`);
          return;
        }

        // TYPING INDICATOR
        if (msg.type === "typing") {
          if (!msg.roomId) return;

          wss.clients.forEach((client) => {
            const extClient = client as ExtendedWebSocket;
            if (
              extClient.roomId === msg.roomId &&
              extClient.userId !== userId &&
              extClient.readyState === WebSocket.OPEN
            ) {
              extClient.send(JSON.stringify({
                type: "user-typing",
                userId: userId,
                roomId: msg.roomId
              }));
            }
          });
          return;
        }

        // STOP TYPING
        if (msg.type === "stop-typing") {
          if (!msg.roomId) return;

          wss.clients.forEach((client) => {
            const extClient = client as ExtendedWebSocket;
            if (
              extClient.roomId === msg.roomId &&
              extClient.userId !== userId &&
              extClient.readyState === WebSocket.OPEN
            ) {
              extClient.send(JSON.stringify({
                type: "user-stop-typing",
                userId: userId,
                roomId: msg.roomId
              }));
            }
          });
          return;
        }

        // LEAVE ROOM
        if (msg.type === "leave-room") {
          const leftRoomId = socket.roomId;
          socket.roomId = undefined;
          
          return socket.send(JSON.stringify({
            type: "left-room",
            roomId: leftRoomId
          }));
        }

        // PING
        if (msg.type === "ping") {
          return socket.send(JSON.stringify({
            type: "pong",
            timestamp: Date.now()
          }));
        }

        // Unknown message type
        return socket.send(JSON.stringify({
          type: "error",
          message: `Unknown message type: ${msg.type}`,
          code: "UNKNOWN_TYPE"
        }));

      } catch (error: any) {
        console.error(" Message error:", error);
        socket.send(JSON.stringify({
          type: "error",
          message: error.message,
          code: "PROCESSING_ERROR"
        }));
      }
    });

    socket.on("close", (code, reason) => {
      console.log(`🔌 Disconnected - User: ${socket.userId}, Code: ${code}`);
      
      // Notify others if user was in a room
      if (socket.roomId) {
        wss.clients.forEach((client) => {
          const extClient = client as ExtendedWebSocket;
          if (
            extClient.roomId === socket.roomId &&
            extClient.userId !== socket.userId &&
            extClient.readyState === WebSocket.OPEN
          ) {
            extClient.send(JSON.stringify({
              type: "user-left",
              userId: socket.userId,
              roomId: socket.roomId
            }));
          }
        });
      }
    });

    socket.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  console.log(" WebSocket server ready");
}