"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const login_service_1 = require("../services/login.service");
const sendResponse_1 = require("../utils/sendResponse");
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return (0, sendResponse_1.sendResponse)(res, {
                success: false,
                message: "Email and password are required",
                statusCode: 400
            });
        }
        const { token, user } = await (0, login_service_1.loginUser)(req.body);
        return (0, sendResponse_1.sendResponse)(res, {
            success: true,
            message: "successfully loggedin",
            data: { token, user },
            statusCode: 200,
        });
    }
    catch (error) {
        return (0, sendResponse_1.sendResponse)(res, {
            success: false,
            message: error.message || "Failed to login",
            statusCode: 400
        });
    }
};
exports.login = login;
