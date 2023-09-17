import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";

import { ErrorMiddleware } from "./middleware/error";
import { authRoute, courseRoute, userRoute } from "./routes";

require("dotenv").config();

export const app = express();

// body parser
app.use(express.json({ limit: "50mb" }));

// cookie parser
app.use(cookieParser());

// morgan
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// cors
app.use(
  cors({
    origin: process.env.ORIGIN,
  }),
);

// testing api
app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: "Welcome to onlearn-lms server",
  });
});

// routes
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/course", courseRoute);

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server`) as any;
  err.statusCode = 404;
  next(err);
});

app.use(ErrorMiddleware);