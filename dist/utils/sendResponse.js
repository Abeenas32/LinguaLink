"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = sendResponse;
function sendResponse(res, options) {
    const { success, message, data, statusCode = 200, error } = options;
    return res.status(statusCode).json({
        success,
        message,
        data: data || null,
        error: error || null,
    });
}
