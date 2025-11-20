import { Request, Response } from "express";
import { createUser } from "../services/user.serviecs";
import { sendResponse } from "../utils/sendResponse";


export const registerUser = async (req: Request, res: Response) => {
    try {
        const user = await createUser(req.body);
        return sendResponse(res, {
            success: true,
            message: "User registered successfully",
            data: user,
            statusCode: 200,
        })
    } catch (error:any) {
        return sendResponse(res,{
            success : false,
            message: "Failed to register user",
            error : error.message || error,
            statusCode : 400,
        }
        )
    }
}