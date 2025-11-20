import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import "dotenv/config";
import userRouter from "./route/user.route"; 
import { sendResponse } from "./utils/sendResponse";

const app: Application = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));

app.get("/", (req: Request, res: Response) => {
  return sendResponse(res, {
    success: true,
    message: "LinguaLink API is running 🚀",
  });
});


app.use("/users", userRouter);
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Global Error:", err);

  return sendResponse(res, {
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
