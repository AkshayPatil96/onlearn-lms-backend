"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.isAuthenticated = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const redis_1 = __importDefault(require("../config/redis"));
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const catchAsyncErrors_1 = require("./catchAsyncErrors");
exports.isAuthenticated = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
        return next(new ErrorHandler_1.default("Please login to access this resource", 401));
    }
    const decoded = jsonwebtoken_1.default.verify(accessToken, process.env.ACCESS_TOKEN);
    if (!decoded) {
        return next(new ErrorHandler_1.default("Please login to access this resource", 401));
    }
    const user = await redis_1.default.get(decoded.id);
    if (!user) {
        return next(new ErrorHandler_1.default("Please login to access this resource", 401));
    }
    req.user = JSON.parse(user);
    next();
});
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
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
exports.authorizeRoles = authorizeRoles;
