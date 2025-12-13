import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../utils/sendResponse";
import { verifyToken as verifyJWT } from "../utils/jwt"; 

interface AuthPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

// Middleware to verify JWT token from Authorization header or cookies
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header (Bearer token) or cookies
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7) 
      : req.cookies?.accessToken; 
    if (!token) {
      return sendResponse(res, {
        success: false,
        message: "Access token is required. Please login first.",
        statusCode: 401
      });
    }

    // Verify token using your existing utility function
    const decoded = verifyJWT(token);

    if (!decoded || !decoded.userId) {
      return sendResponse(res, {
        success: false,
        message: "Invalid or expired token. Please login again.",
        statusCode: 401
      });
    }

    // Attach user info to request object
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      iat: decoded.iat,
      exp: decoded.exp
    };

    // Continue to next middleware/route handler
    next();
  } catch (error: any) {
    console.error("Token verification error:", error);
    return sendResponse(res, {
      success: false,
      message: "Authentication failed",
      statusCode: 401,
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

//  Optional auth middleware - doesn't fail if token is missing
//   Useful for routes that can work with or without authentication
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : req.cookies?.accessToken;

    if (token) {
      const decoded = verifyJWT(token);
      if (decoded && decoded.userId) {
        req.user = {
          userId: decoded.userId,
          email: decoded.email,
          iat: decoded.iat,
          exp: decoded.exp
        };
      }
    }

    next();
  } catch (error) {
    // Continue even if there's an error
    next();
  }
};