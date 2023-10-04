"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderAnalytics = exports.getCourseAnalytics = exports.getUserAnalytics = void 0;
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const analytics_generator_1 = require("../utils/analytics.generator");
const user_model_1 = __importDefault(require("../models/user.model"));
const course_model_1 = __importDefault(require("../models/course.model"));
const order_model_1 = __importDefault(require("../models/order.model"));
// get users analytics => /api/v1/analytics/users => GET  (Admin)
exports.getUserAnalytics = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const users = await (0, analytics_generator_1.generateLast12MonthData)(user_model_1.default);
        res.status(200).json({
            success: true,
            users,
        });
    }
    catch (error) {
        next(new ErrorHandler_1.default(error.message, error.statusCode));
    }
});
// get courses analytics => /api/v1/analytics/courses => GET  (Admin)
exports.getCourseAnalytics = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const courses = await (0, analytics_generator_1.generateLast12MonthData)(course_model_1.default);
        res.status(200).json({
            success: true,
            courses,
        });
    }
    catch (error) {
        next(new ErrorHandler_1.default(error.message, error.statusCode));
    }
});
// get order analytics => /api/v1/analytics/orders => GET  (Admin)
exports.getOrderAnalytics = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const orders = await (0, analytics_generator_1.generateLast12MonthData)(order_model_1.default);
        res.status(200).json({
            success: true,
            orders,
        });
    }
    catch (error) {
        next(new ErrorHandler_1.default(error.message, error.statusCode));
    }
});
