// src/websocket/index.ts
import WebSocket, { WebSocketServer } from "ws";
import { MessageService } from "../services/message.service";
import { roomService } from "../services/chat.service";
import { verifyToken as verifyJWT } from "../utils/jwt";
import { prisma } from '../utils/prisma';
import { translateText } from '../services/translation.service';

interface AuthPayload {
  userId: string;
  email: string;
}

interface ExtendedWebSocket extends WebSocket {
  userId?: string;
  roomId?: string;
  userLang?: string;
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

      // Verify JWT
      const decoded = verifyJWT(token);
      
      if (!decoded || !decoded.userId) {
        socket.send(JSON.stringify({
          type: "error",
          message: "Invalid or expired token",
          code: "AUTH_INVALID_TOKEN"
        }));
        return socket.close(4001, "Unauthorized");
      }

      socket.userId = decoded.userId;

      // Get user's language from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { language: true, username: true }
      });

      socket.userLang = user?.language || "en";

      console.log(`✅ User authenticated: ${user?.username} (${decoded.userId}) | Language: ${socket.userLang}`);

      // Send connection success
      socket.send(JSON.stringify({
        type: "connected",
        message: "Successfully connected to LinguaLink",
        userId: decoded.userId,
        language: socket.userLang
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
          try {
            // Validation
            if (!msg.text || !msg.roomId) {
              return socket.send(JSON.stringify({
                type: "error",
                message: "text and roomId are required",
                code: "MISSING_FIELDS"
              }));
            }

            // Verify user access
            const accessCheck = await roomService.verifyUserAccess(userId, msg.roomId);
            if (!accessCheck.success || !accessCheck.hasAccess) {
              return socket.send(JSON.stringify({
                type: "error",
                message: "You are not a member of this room",
                code: "NOT_ROOM_MEMBER"
              }));
            }

            // Get room with users and their languages
            const room = await prisma.chatRoom.findUnique({
              where: { id: msg.roomId },
              include: {
                users: {
                  select: {
                    id: true,
                    language: true,
                    username: true,
                  }
                }
              }
            });

            if (!room) {
              return socket.send(JSON.stringify({
                type: "error",
                message: "Room not found",
                code: "ROOM_NOT_FOUND"
              }));
            }

            // Get sender's language
            const sender = room.users.find((u) => u.id === userId);
            const senderLang = sender?.language || "en";

            console.log(`📤 Sender: ${sender?.username} (${senderLang})`);

            // Get all receivers (everyone except sender)
            const receivers = room.users.filter((u) => u.id !== userId);

            if (receivers.length === 0) {
              return socket.send(JSON.stringify({
                type: "error",
                message: "No receivers in room",
                code: "NO_RECEIVERS"
              }));
            }

            console.log(`💬 Processing message for ${receivers.length} receiver(s)`);

            let successCount = 0;
            let failCount = 0;
            const errors: string[] = [];

            // Process message for each receiver
            for (const receiver of receivers) {
              try {
                const receiverLang = receiver.language || "en";

                console.log(`📥 Translating for: ${receiver.username} (${receiverLang})`);

                // ✅ TRANSLATE MESSAGE
                const translation = await translateText(
                  msg.text,
                  senderLang,
                  receiverLang
                );

                if (!translation.success) {
                  console.warn(`⚠️ Translation failed for ${receiver.username}: ${translation.error}`);
                } else {
                  console.log(`✅ Translated: "${msg.text}" → "${translation.translatedText}"`);
                }

                // SAVE TRANSLATED MESSAGE TO DATABASE
                const savedMsg = await prisma.message.create({
                  data: {
                    roomId: msg.roomId,
                    senderId: userId,
                    // Save translated text
                    text: translation.translatedText, 
                  },
                  include: {
                    sender: {
                      select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                      },
                    },
                  },
                });

                // Update room timestamp
                await prisma.chatRoom.update({
                  where: { id: msg.roomId },
                  data: { updatedAt: new Date() },
                });

                console.log(`💾 Message saved for ${receiver.username}`);

                // BROADCAST TO RECEIVER (if online)
                let sentViaWebSocket = false;
                wss.clients.forEach((client) => {
                  const extClient = client as ExtendedWebSocket;
                  if (
                    extClient.userId === receiver.id &&
                    extClient.roomId === msg.roomId &&
                    extClient.readyState === WebSocket.OPEN
                  ) {
                    extClient.send(
                      JSON.stringify({
                        type: "new-message",
                        message: savedMsg,
                        translationSuccess: translation.success,
                        translationError: translation.error,
                      })
                    );
                    sentViaWebSocket = true;
                  }
                });

                if (sentViaWebSocket) {
                  console.log(`✅ Sent to ${receiver.username} (online)`);
                } else {
                  console.log(`📥 Saved for ${receiver.username} (offline)`);
                }

                successCount++;
              } catch (error: any) {
                failCount++;
                console.error(`❌ Failed for ${receiver.username}:`, error.message);
                errors.push(`${receiver.username}: ${error.message}`);
              }
            }

            console.log(`📊 Message delivery: ${successCount} success, ${failCount} failed`);

            // Send confirmation to sender
            socket.send(
              JSON.stringify({
                type: "message-sent",
                roomId: msg.roomId,
                successCount,
                failCount,
                errors: errors.length > 0 ? errors : undefined,
              })
            );

            return;
          } catch (error: any) {
            console.error("❌ Send message error:", error);
            return socket.send(
              JSON.stringify({
                type: "error",
                message: "Failed to send message",
                code: "SEND_MESSAGE_ERROR",
                details: error.message,
              })
            );
          }
        }
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

       
        if (msg.type === "leave-room") {
          const leftRoomId = socket.roomId;
          socket.roomId = undefined;
          
          console.log(`👋 User ${userId} left room ${leftRoomId}`);

          return socket.send(JSON.stringify({
            type: "left-room",
            roomId: leftRoomId
          }));
        }

        
        if (msg.type === "ping") {
          return socket.send(JSON.stringify({
            type: "pong",
            timestamp: Date.now()
          }));
        }

        console.warn(`Unknown message type: ${msg.type}`);
        return socket.send(JSON.stringify({
          type: "error",
          message: `Unknown message type: ${msg.type}`,
          code: "UNKNOWN_TYPE"
        }));

      } catch (error: any) {
        console.error(" Message processing error:", error);
        socket.send(JSON.stringify({
          type: "error",
          message: "Failed to process message",
          code: "PROCESSING_ERROR",
          details: error.message
        }));
      }
    });

    // Handle connection close
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

  console.log("WebSocket server ready with HuggingFace translation");
}