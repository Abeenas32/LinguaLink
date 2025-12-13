import { Request, Response } from "express";
import { createUser } from "../services/user.serviecs";
import { sendResponse } from "../utils/sendResponse";
import { generateToken } from "../utils/jwt";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const user = await createUser(req.body);
    const token = generateToken(user.id,user.email);

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return sendResponse(res, {
      success: true,
      message: "User registered successfully",
      data: user,
      statusCode: 200,
    });

  } catch (error: any) {
    return sendResponse(res, {
      success: false,
      message: error.message,
      error: error.message,
      statusCode: 400,
    });
  }
};
