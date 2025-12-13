import  jwt  from 'jsonwebtoken';
import { Request , Response , NextFunction } from "express";
import { sendResponse } from '../utils/sendResponse';

 export interface AuthReq extends Request {
     user ? :any;
 }

 export const authenticate =  async (req: AuthReq, res : Response , next: NextFunction) : Promise<void>  => {
 try {
    const authHeader  = req.headers?.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer ')) {
        sendResponse(res, {
             success : false,
             message : "Access denied, no token provided",
             statusCode : 401
        })
        return ;
    }
    const token = authHeader?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
    req.user = decoded;
    next();    
 } catch (error : any) {
    sendResponse (res, {
         success : false,
          message : error.message,
          statusCode : 401,
    })
    }
}
