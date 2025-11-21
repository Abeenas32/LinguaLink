"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
require("dotenv/config");
const user_route_1 = __importDefault(require("./route/user.route"));
const sendResponse_1 = require("./utils/sendResponse");
const auth_route_1 = __importDefault(require("./route/auth.route"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)("dev"));
app.get("/", (req, res) => {
    return (0, sendResponse_1.sendResponse)(res, {
        success: true,
        message: "LinguaLink API is running 🚀",
    });
});
app.use("/users", user_route_1.default);
app.use("/auth", auth_route_1.default);
app.use((err, req, res, next) => {
    console.error("Global Error:", err);
    return (0, sendResponse_1.sendResponse)(res, {
        success: false,
        message: err?.message || "Something went wrong",
        statusCode: err?.statusCode || 500,
        error: err,
    });
});
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
process.on("SIGINT", () => {
    console.log("🔻 Server shutting down...");
    process.exit();
});
