"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const error_1 = require("./middleware/error");
// const userRouter = require("./routes/user.route.js");
// const authRouter = require("./routes/auth.js");
require("dotenv").config();
exports.app = (0, express_1.default)();
// body parser
exports.app.use(express_1.default.json({ limit: "50mb" }));
// cookie parser
exports.app.use((0, cookie_parser_1.default)());
// cors
exports.app.use((0, cors_1.default)({
    origin: process.env.ORIGIN,
}));
// testing api
exports.app.get("/", (req, res, next) => {
    res.status(200).json({
        success: true,
        message: "Welcome to onlearn-lms server",
    });
});
// routes
// app.use("/api/v1/auth", authRouter);
exports.app.all("*", (req, res, next) => {
    const err = new Error(`Can't find ${req.originalUrl} on this server`);
    err.statusCode = 404;
    next(err);
});
exports.app.use(error_1.ErrorMiddleware);
