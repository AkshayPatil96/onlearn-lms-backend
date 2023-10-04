"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const error_1 = require("./middleware/error");
const routes_1 = require("./routes");
require("dotenv").config();
exports.app = (0, express_1.default)();
// body parser
exports.app.use(express_1.default.json({ limit: "50mb" }));
// cookie parser
exports.app.use((0, cookie_parser_1.default)());
// morgan
if (process.env.NODE_ENV === "development") {
    exports.app.use((0, morgan_1.default)("dev"));
}
// cors
exports.app.use((0, cors_1.default)({
    origin: ["http://localhost:3000"],
    credentials: true,
}));
// testing api
exports.app.get("/", (req, res, next) => {
    res.status(200).json({
        success: true,
        message: "Welcome to onlearn-lms server",
    });
});
// routes
exports.app.use("/api/v1/auth", routes_1.authRoute);
exports.app.use("/api/v1/user", routes_1.userRoute);
exports.app.use("/api/v1/course", routes_1.courseRoute);
exports.app.use("/api/v1/order", routes_1.orderRoute);
exports.app.use("/api/v1/notification", routes_1.notificationRoute);
exports.app.use("/api/v1/admin", routes_1.adminRouter);
exports.app.use("/api/v1/analytics", routes_1.analyticsRouter);
exports.app.use("/api/v1/layout", routes_1.layoutRouter);
// Error
exports.app.all("*", (req, res, next) => {
    const err = new Error(`Can't find ${req.originalUrl} on this server`);
    err.statusCode = 404;
    next(err);
});
exports.app.use(error_1.ErrorMiddleware);
