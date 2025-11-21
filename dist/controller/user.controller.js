"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = void 0;
const user_serviecs_1 = require("../services/user.serviecs");
const sendResponse_1 = require("../utils/sendResponse");
const registerUser = async (req, res) => {
    try {
        const user = await (0, user_serviecs_1.createUser)(req.body);
        return (0, sendResponse_1.sendResponse)(res, {
            success: true,
            message: "User registered successfully",
            data: user,
            statusCode: 200,
        });
    }
    catch (error) {
        return (0, sendResponse_1.sendResponse)(res, {
            success: false,
            message: "Failed to register user",
            error: error.message || error,
            statusCode: 400,
        });
    }
};
exports.registerUser = registerUser;
