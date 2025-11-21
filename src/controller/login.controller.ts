import { Request, Response } from 'express';
import { loginUser } from '../services/login.service';
import { sendResponse } from '../utils/sendResponse';

export const login = async (req: Request, res: Response) => {
    try {
        const {email, password} = req.body;
        if(!email || !password) {
             return sendResponse(res, {
                 success : false,
                 message : "Email and password are required",
                  statusCode :400
             })
        }
        const { token, user } = await loginUser(req.body);
        return sendResponse(res, {
            success: true,
            message: "successfully loggedin",
            data: { token, user },
            statusCode: 200,
        });

    } catch (error: any) {
        return sendResponse(res, {
            success: false,
            message: error.message || "Failed to login",
            statusCode: 400
        });
    }
}