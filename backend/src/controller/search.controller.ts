import { Request, Response } from "express";
import { findUser } from "../services/search.service";
import { sendResponse } from "../utils/sendResponse";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const userName = (req.query.q as string) || "";

    if (!userName.trim()) {
      return sendResponse(res, {
        success: false,
        message: "Please provide the userName",
        statusCode: 400,
      });
    }

    const users = await findUser(userName);

    if (!users || users.length === 0) {
      return sendResponse(res, {
        success: false,
        message: "No users found",
        statusCode: 404,
      });
    }

    return sendResponse(res, {
      success: true,
      message: "Users found",
      data: users,
      statusCode: 200,
    });
  } catch (error: any) {
    console.error(error);
    return sendResponse(res, {
      success: false,
      message: error.message || "Internal server error",
      statusCode: 500,
    });
  }
};
