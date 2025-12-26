import { success } from "zod";
import { prisma } from "../utils/prisma";

export const MessageService = {
  async createMessage(roomId: string, senderId: string, text: string) {
    try {
      if(!roomId || !senderId || !text) {
         return  { succes :false, message : "roomId, senderId and text are required"}
      }
      if(text.trim().length === 0) {
         return { success: false, message: "Message can't be empty"}
      }
      const room = await prisma.chatRoom.findFirst({
        where :  {
          id :roomId,
          users :  {
            some :  {id: senderId}
          }
        }
      })
      if(!room) {
        return  {
          succes :false,
          message: "Room not found or you are not a member"
        }
      }
      const msg = await prisma.message.create({
        data: { roomId, senderId, text:text.trim() },
        include  : {
          sender: {
            select: {
               id: true,
               username: true,
               firstName: true,
               lastName : true
            }
          }
        }
      });
      return {
        success: true,
        message: "Message saved",
        data: msg
      };
    } catch (error: any) {
      console.error("error in creating message", error.message)
      return {
        success: false,
        message: error.message
      };
    }
  },

  async getMessage(roomId: string, userId?: string) {
    try {
      if(!roomId) {
         return {
          success:false,
          message: "Room Id is required "
         }
      }
      
      // Get all messages for the room
      // If userId provided, prefer messages with translatedText (for receiver) or without (for sender)
      const messages = await prisma.message.findMany({
        where: { 
          roomId,
          // Filter: get original messages (no translatedText) OR translated messages for this user
          // We'll filter duplicates in the route handler
        },
        orderBy: { createdAt: "asc" },
        include: {
           sender: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName :true
            }
           }
        }
      });

      // Group by original message ID to avoid duplicates
      // Prefer messages with translatedText if userId is provided
      const messageMap = new Map();
      messages.forEach(msg => {
        const key = `${msg.senderId}-${msg.text}-${Math.floor(new Date(msg.createdAt).getTime() / 1000)}`; // Group by sender, text, and time (within same second)
        const existing = messageMap.get(key);
        
        if (!existing) {
          messageMap.set(key, msg);
        } else if (userId && msg.translatedText && msg.senderId !== userId) {
          // Prefer translated version for receivers
          messageMap.set(key, msg);
        } else if (!msg.translatedText && existing.translatedText && existing.senderId === userId) {
          // Prefer original for sender
          messageMap.set(key, msg);
        }
      });

      const uniqueMessages = Array.from(messageMap.values());

      return {
        success: true,
        message: "Messages fetched",
        data: uniqueMessages
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message
      };
    }
  }
};
