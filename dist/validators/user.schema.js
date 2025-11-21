"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.registerSchema = zod_1.default.object({
    firstName: zod_1.default.string().trim().min(2, "First name must be at least 2 characters long").max(50, "First name is too long"),
    lastName: zod_1.default.string().trim().max(50, "Last Name is too long").min(2, "Last name must be at least 2 characters long"),
    email: zod_1.default.string().trim().email("Invalid email format"),
    password: zod_1.default.string().min(6, "Your password must be 6 character long").regex(/(?=.*[a-z])/, "Password must contain at least 1 lowercase letter")
        .regex(/(?=.*[A-Z])/, "Password must contain at least 1 uppercase letter")
        .regex(/(?=.*\d)/, "Password must contain at least 1 number")
        .regex(/(?=.*[!@#$%^&*(),.?":{}|<>_\-\/\\])/, "Password must contain at least 1 special character"),
}).strict();
