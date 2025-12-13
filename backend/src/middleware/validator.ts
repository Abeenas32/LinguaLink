import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { sendResponse } from "../utils/sendResponse";

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return sendResponse(res, {
          success: false,
          message: error.message,
          error: error,
          statusCode: 400,
        });
      }

      return sendResponse(res, {
        success: false,
        message: "Validation failed",
        statusCode: 500,
      });
    }
  };
};

