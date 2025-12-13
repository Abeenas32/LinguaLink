import { success } from "zod";
import { prisma } from "../utils/prisma";

export const roomService = {
    async createRoom(userIds: string[]) {
        try {
            const room = await prisma.chatRoom.create({
                data: {
                    users: { connect: userIds.map(id => ({ id })) }
                }
            });
            return { success: true, room }
        } catch (error: any) {
            return { success: false, error: error.message };
        }

    },
    async getRoom(roomId: string) {
        try {
            const room = await prisma.chatRoom.findUnique({
                where: { id: roomId },
                include: { users: true, messages: true }
            });
            if (!room) {
                return { success: false, error: "Room not found" };
            }
            return { success: true, room }
        } catch (error: any) {
            return { success: false, message: error.message };

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
                        some: { id: userId }
                    }
                }
            });
             console.log("Found room:", room);
            return { success: true, hasAccess: !!room }
        } catch (error: any) {
            console.error("❌ Error in verifyUserAccess:", error);
            return {
                success: false,
                error: error.message,
                 hasAccess: false
            }
        }
    },
    async getUserRooms(userId: string) {
        try {
            const rooms = await prisma.chatRoom.findMany({
                where: {
                    users: {
                        some: { id: userId }
                    }
                },
                include: {
                    users: {
                        select: {
                            id: true,
                            username: true,
                            firstName: true,
                            lastName: true
                        }
                    },
                    messages: {
                        orderBy: { createdAt: "desc" },
                        take: 1
                    }
                },
                orderBy: { updatedAt: "desc" }
            });
            return { success: true, rooms }
        } catch (error: any) {
            console.error("Errror in getting user rooms", error.messages);
            return { success: false, error: error.message };
        }
    }

}
