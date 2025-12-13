import { Response } from "express";

interface ResponseData {
  success: boolean;
  message: string;
  data?: any;
  statusCode?: number;
  error?: any;
  count?: number;
}

export const sendResponse = (res: Response, data: ResponseData) => {
  const statusCode = data.statusCode || (data.success ? 200 : 400);
  
  const response: any = {
    success: data.success,
    message: data.message,
  };

  if (data.data !== undefined) {
    response.data = data.data;
  }

  if (data.count !== undefined) {
    response.count = data.count;
  }

  if (data.error !== undefined) {
    response.error = data.error;
  }

  return res.status(statusCode).json(response);
};