require("dotenv").config();
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import redis from "../config/redis";
import UserModel, { IUser } from "../models/user.model";

interface ITokenOptions {
  expires: Date;
  maxAge: number;
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none" | undefined;
  secure?: boolean;
}

// parse env variables to integrate with callback values
export const accessTokenExpire = parseInt(
  process.env.ACCESS_TOKEN_EXPIRY || "300",
  10,
);
export const refreshTokenExpire = parseInt(
  process.env.REFRESH_TOKEN_EXPIRY || "1200",
  10,
);

// options for cookies
export const accessTokenOptions: ITokenOptions = {
  expires: new Date(Date.now() + accessTokenExpire * 1000 * 60 * 60),
  maxAge: accessTokenExpire * 1000 * 60 * 60,
  httpOnly: true,
  sameSite: "lax",
};

export const refreshTokenOptions: ITokenOptions = {
  expires: new Date(Date.now() + refreshTokenExpire * 1000 * 60 * 60 * 24),
  maxAge: refreshTokenExpire * 1000 * 60 * 60 * 24,
  httpOnly: true,
  sameSite: "lax",
};

export const sendToken = (user: IUser, statusCode: number, res: Response) => {
  const accessToken = user.signAccessToken();
  const refreshToken = user.signRefreshToken();

  // upload session to redis
  redis.set(user._id.toString(), JSON.stringify(user));

  // only set secure to true if in production
  if (process.env.NODE_ENV === "production") {
    accessTokenOptions.secure = true;
    refreshTokenOptions.secure = true;
  }

  // set cookies
  res.cookie("accessToken", accessToken, accessTokenOptions);
  res.cookie("refreshToken", refreshToken, refreshTokenOptions);

  // send response
  res.status(statusCode).json({
    success: true,
    user,
    accessToken,
  });
};
