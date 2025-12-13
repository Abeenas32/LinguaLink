import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import "dotenv/config";
import userRouter from "./route/user.route";
import authRouter from "./route/auth.route";
import chatRouter from "./route/chat.route"; // ADD THIS
import { sendResponse } from "./utils/sendResponse";
import cookieParser from "cookie-parser";

const app: Application = express();

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:8080",
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(morgan("dev"));

app.get("/", (req: Request, res: Response) => {
  return sendResponse(res, {
    success: true,
    message: "LinguaLink API is running ",
  });
});

app.use("/users", userRouter);
app.use("/auth", authRouter);
app.use("/chat", chatRouter); 

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Global Error:", err);

  return sendResponse(res, {
    success: false,
    message: err?.message || "Something went wrong",
    statusCode: err?.statusCode || 500,
    error: err,
  });
});

export default app;