// src/route/chat.route.ts
import { Router, Request, Response } from "express";
import { roomService } from "../services/chat.service";
import { MessageService } from "../services/message.service";
import { sendResponse } from "../utils/sendResponse";
import { verifyToken } from "../middleware/auth.middleware";

const chatRouter = Router();

// Protect all chat routes with authentication
chatRouter.use(verifyToken);



  // POST /chat/rooms
  // Create a new chat room
  // Body: { userIds: string[] }
 
chatRouter.post("/rooms", async (req: Request, res: Response) => {
  try {
    const { userIds } = req.body;
    const currentUserId = req.user?.userId;

    if (!userIds || !Array.isArray(userIds)) {
      return sendResponse(res, {
        success: false,
        message: "userIds array is required",
        statusCode: 400
      });
    }

    if (userIds.length === 0) {
      return sendResponse(res, {
        success: false,
        message: "At least one user ID is required",
        statusCode: 400
      });
    }

    // Add current user to the room if not already included
    const allUserIds = [...new Set([currentUserId!, ...userIds])];

    const result = await roomService.createRoom(allUserIds);

    return sendResponse(res, {
      success: result.success,
      message: result.success
        ? "Room created successfully"
        : (result.error || "Failed to create room"),
      data: result.room,
      statusCode: result.success ? 201 : 400
    });
  } catch (error: any) {
    console.error("Error creating room:", error);
    return sendResponse(res, {
      success: false,
      message: "Failed to create room",
      statusCode: 500,
      error: error.message
    });
  }
});


//   GET /chat/rooms
//  Get all rooms for the current user
 
chatRouter.get("/rooms", async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user?.userId;

    if (!currentUserId) {
      return sendResponse(res, {
        success: false,
        message: "User not authenticated",
        statusCode: 401
      });
    }

    const result = await roomService.getUserRooms(currentUserId);

    return sendResponse(res, {
      success: result.success,
      message: result.success
        ? "Rooms fetched successfully"
        : (result.error || "Failed to fetch rooms"),
      data: result.rooms,
      statusCode: result.success ? 200 : 400
    });
  } catch (error: any) {
    console.error("Error getting rooms:", error);
    return sendResponse(res, {
      success: false,
      message: "Failed to get rooms",
      statusCode: 500,
      error: error.message
    });
  }
});


  // GET /chat/rooms/:roomId
  // Get room details by ID
 
chatRouter.get("/rooms/:roomId", async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const currentUserId = req.user?.userId;

    const result = await roomService.getRoom(roomId);

    if (!result.success) {
      return sendResponse(res, {
        success: false,
        message: result.error || "Room not found",
        statusCode: 404
      });
    }

    // Verify user has access to this room
    const hasAccess = result.room?.users.some(
      (user: any) => user.id === currentUserId
    );

    if (!hasAccess) {
      return sendResponse(res, {
        success: false,
        message: "You don't have access to this room",
        statusCode: 403
      });
    }

    return sendResponse(res, {
      success: true,
      message: "Room found",
      data: result.room,
      statusCode: 200
    });
  } catch (error: any) {
    console.error("Error getting room:", error);
    return sendResponse(res, {
      success: false,
      message: "Failed to get room",
      statusCode: 500,
      error: error.message
    });
  }
});

// ============== MESSAGE ROUTES ==============


  // GET /chat/rooms/:roomId/messages
  // Get messages for a room
 
chatRouter.get("/rooms/:roomId/messages", async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const currentUserId = req.user?.userId;
    console.log("🔍 DEBUG INFO:");
    console.log("roomId:", roomId);
    console.log("currentUserId:", currentUserId);
    console.log("req.user:", req.user);

    // Verify user has access to this room
    const accessCheck = await roomService.verifyUserAccess(currentUserId!, roomId);
    console.log("access check result", accessCheck);

    if (!accessCheck.success || !accessCheck.hasAccess) {
      return sendResponse(res, {
        success: false,
        message: "You don't have access to this room",
        statusCode: 403
      });
    }

    const result = await MessageService.getMessage(roomId);

    return sendResponse(res, {
      success: result.success,
      message: result.message || "Failed to fetch messages",
      data: result.data,
      statusCode: result.success ? 200 : 400
    });
  } catch (error: any) {
    console.error("Error getting messages:", error);
    return sendResponse(res, {
      success: false,
      message: "Failed to get messages",
      statusCode: 500,
      error: error.message
    });
  }
});


//   POST /chat/rooms/:roomId/messages
//  Send a message to a room (HTTP alternative to WebSocket)
//   Body: { text: string }
chatRouter.post("/rooms/:roomId/messages", async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { text } = req.body;
    const currentUserId = req.user?.userId;

    if (!text || typeof text !== "string") {
      return sendResponse(res, {
        success: false,
        message: "text is required and must be a string",
        statusCode: 400
      });
    }

    if (text.trim().length === 0) {
      return sendResponse(res, {
        success: false,
        message: "Message text cannot be empty",
        statusCode: 400
      });
    }

    // Verify user has access to this room
    const accessCheck = await roomService.verifyUserAccess(currentUserId!, roomId);

    if (!accessCheck.success || !accessCheck.hasAccess) {
      return sendResponse(res, {
        success: false,
        message: "You don't have access to this room",
        statusCode: 403
      });
    }

    const result = await MessageService.createMessage(roomId, currentUserId!, text,);

    return sendResponse(res, {
      success: Boolean(result.success),
      message: result.message || "Failed to send message",
      data: result.data,
      statusCode: result.success ? 201 : 400
    });
  } catch (error: any) {
    console.error("Error sending message:", error);
    return sendResponse(res, {
      success: false,
      message: "Failed to send message",
      statusCode: 500,
      error: error.message
    });
  }
});

export default chatRouter;