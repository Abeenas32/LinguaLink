  import {Response} from "express"


export function sendResponse(res: Response, options: {
    success: boolean;
    message: string;
    data?: any;
    statusCode?: number;
    error?: any;
}) {
    const { success, message, data, statusCode = 200, error } = options;
    return res.status(statusCode).json({
        success,
        message,
        data: data || null,
        error: error || null,
    }); 
}