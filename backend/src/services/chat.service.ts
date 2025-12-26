import { success } from "zod";
import { prisma } from "../utils/prisma";

export const roomService = {
  async createRoom(userIds: string[]) {
    try {
      // Sort and normalize user IDs for comparison
      const normalizedUserIds = [...new Set(userIds)].sort();
      
      // Find all rooms that contain all the requested users
      const candidateRooms = await prisma.chatRoom.findMany({
        where: {
          AND: normalizedUserIds.map((id) => ({ users: { some: { id } } })),
        },
        include: { users: true, messages: true },
      });
      
      // Check if any room has exactly the same set of users
      for (const room of candidateRooms) {
        const roomUserIds = room.users.map(u => u.id).sort();
        
        // Check if room has exactly the same users (same count and same IDs)
        if (roomUserIds.length === normalizedUserIds.length &&
            roomUserIds.every((id, index) => id === normalizedUserIds[index])) {
          console.log("Room already exists with same users", room.id);
          return { success: true, room };
        }
      }

      // No existing room found, create a new one
      const newRoom = await prisma.chatRoom.create({
        data: {
          users: {
            connect: normalizedUserIds.map(id => ({ id })),
          },
        },
        include: { users: true, messages: true },
      });
      
      console.log("Created new room", newRoom.id);
      return { success: true, room: newRoom };
    } catch (error: any) {
      console.error("Error creating room:", error);
      return { success: false, error: error.message };
    }
  },
  async getRoom(roomId: string) {
    try {
      const room = await prisma.chatRoom.findUnique({
        where: { id: roomId },
        include: { users: true, messages: true },
      });
      if (!room) {
        return { success: false, error: "Room not found" };
      }
      return { success: true, room };
    } catch (error: any) {
      console.error("Error in getRoom:", error);
      return { success: false, error: error.message };
    }
  },
  async verifyUserAccess(userId: string, roomId: string) {
    try {
      console.log("🔍 Verifying access:");
      console.log("userId:", userId);
      console.log("roomId:", roomId);
      const room = await prisma.chatRoom.findFirst({
        where: {
          id: roomId,
          users: {
            some: { id: userId },
          },
        },
      });
      console.log("Found room:", room);
      return { success: true, hasAccess: !!room };
    } catch (error: any) {
      console.error("❌ Error in verifyUserAccess:", error);
      return {
        success: false,
        error: error.message,
        hasAccess: false,
      };
    }
  },
  async getUserRooms(userId: string) {
    try {
      const rooms = await prisma.chatRoom.findMany({
        where: {
          users: {
            some: { id: userId },
          },
        },
        include: {
          users: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: { updatedAt: "desc" },
      });
      return { success: true, rooms };
    } catch (error: any) {
      console.error("Errror in getting user rooms", error.messages);
      return { success: false, error: error.message };
    }
  },
};
