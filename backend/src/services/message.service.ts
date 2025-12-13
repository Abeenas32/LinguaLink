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

  async getMessage(roomId: string) {
    try {
      if(!roomId) {
         return {
          success:false,
          message: "Room Id is required "
         }
      }
      const messages = await prisma.message.findMany({
        where: { roomId },
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

      return {
        success: true,
        message: "Messages fetched",
        data: messages
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message
      };
    }
  }
};
