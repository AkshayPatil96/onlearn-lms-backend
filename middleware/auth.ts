import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import redis from "../config/redis";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncErrors } from "./catchAsyncErrors";

export const isAuthenticated = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      return next(
        new ErrorHandler("Please login to access this resource", 401),
      );
    }

    const decoded: any = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN as string,
    );

    if (!decoded) {
      return next(
        new ErrorHandler("Please login to access this resource", 401),
      );
    }

    const user = await redis.get(decoded.id);

    if (!user) {
      return next(
        new ErrorHandler("Please login to access this resource", 401),
      );
    }

    req.user = JSON.parse(user);

    next();
  },
);

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return next({
        message: `Role (${userRole}) is not allowed to access this resource`,
        status: 403, // Forbidden
      });
    }

    next();
  };
};
