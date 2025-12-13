"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = require("../utils/prisma");
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const createUser = async (input) => {
    try {
        const firstName = (0, sanitize_html_1.default)(input.firstName);
        const lastName = (0, sanitize_html_1.default)(input.lastName);
        const email = (0, sanitize_html_1.default)(input.email);
        const hasedPassword = await bcrypt_1.default.hash(input.password, 12);
        const user = await prisma_1.prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                password: hasedPassword,
                username: email.split("@")[0],
            },
        });
        const { password, ...safeUser } = user;
        return safeUser;
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            throw error;
        }
    }
};
exports.createUser = createUser;
