"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToken = exports.refreshTokenOptions = exports.accessTokenOptions = exports.refreshTokenExpire = exports.accessTokenExpire = void 0;
require("dotenv").config();
const redis_1 = __importDefault(require("../config/redis"));
// parse env variables to integrate with callback values
exports.accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRY || "300", 10);
exports.refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRY || "1200", 10);
// options for cookies
exports.accessTokenOptions = {
    expires: new Date(Date.now() + exports.accessTokenExpire * 1000 * 60 * 60),
    maxAge: exports.accessTokenExpire * 1000 * 60 * 60,
    httpOnly: true,
    sameSite: "lax",
};
exports.refreshTokenOptions = {
    expires: new Date(Date.now() + exports.refreshTokenExpire * 1000 * 60 * 60 * 24),
    maxAge: exports.refreshTokenExpire * 1000 * 60 * 60 * 24,
    httpOnly: true,
    sameSite: "lax",
};
const sendToken = (user, statusCode, res) => {
    const accessToken = user.signAccessToken();
    const refreshToken = user.signRefreshToken();
    // upload session to redis
    redis_1.default.set(user._id.toString(), JSON.stringify(user));
    // only set secure to true if in production
    if (process.env.NODE_ENV === "production") {
        exports.accessTokenOptions.secure = true;
        exports.refreshTokenOptions.secure = true;
    }
    // set cookies
    res.cookie("accessToken", accessToken, exports.accessTokenOptions);
    res.cookie("refreshToken", refreshToken, exports.refreshTokenOptions);
    // send response
    res.status(statusCode).json({
        success: true,
        user,
        accessToken,
    });
};
exports.sendToken = sendToken;
