"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const sendResponse_1 = require("../utils/sendResponse");
const validate = (schema) => {
    return (req, res, next) => {
        try {
            const parsed = schema.parse(req.body);
            req.body = parsed;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return (0, sendResponse_1.sendResponse)(res, {
                    success: false,
                    message: error.message,
                    error: error,
                    statusCode: 400,
                });
            }
            return (0, sendResponse_1.sendResponse)(res, {
                success: false,
                message: "Validation failed",
                statusCode: 500,
            });
        }
    };
};
exports.validate = validate;
