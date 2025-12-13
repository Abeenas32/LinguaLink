"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = require("../utils/prisma");
const jwt_1 = require("../utils/jwt");
const loginUser = async (input) => {
    const { email, password } = input;
    const user = await prisma_1.prisma.user.findUnique({
        where: { email }
    });
    if (!user) {
        throw new Error("Email doesnot exists");
    }
    const checkPassword = await bcrypt_1.default.compare(password, user.password);
    if (!checkPassword) {
        throw new Error("Password deosnot match");
    }
    const token = (0, jwt_1.generateToken)(user.id, user.email);
    const { password: _, ...safeUser } = user;
    return { token, user: safeUser };
};
exports.loginUser = loginUser;
