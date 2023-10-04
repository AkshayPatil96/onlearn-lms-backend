"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = void 0;
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const user_model_1 = __importDefault(require("../models/user.model"));
const course_model_1 = __importDefault(require("../models/course.model"));
const path_1 = __importDefault(require("path"));
const ejs_1 = __importDefault(require("ejs"));
const notification_model_1 = __importDefault(require("../models/notification.model"));
const sendMail_1 = __importDefault(require("../utils/sendMail"));
const order_service_1 = require("../services/order.service");
// create order   =>   /api/v1/order/new
exports.createOrder = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const { courseId, payment_info } = req.body;
        const user = await user_model_1.default.findById(req.user?._id);
        const courseExistInUser = user?.courses.find((course) => course.courseId.toString() === courseId);
        if (courseExistInUser) {
            return next(new ErrorHandler_1.default("You have already purchased this course", 400));
        }
        const course = await course_model_1.default.findOne({
            _id: courseId,
            isDeleted: false,
        });
        if (!course) {
            return next(new ErrorHandler_1.default("Course not found", 404));
        }
        const data = {
            user: req.user?._id,
            courseId: course._id,
            payment_info,
        };
        (0, order_service_1.newOrder)(data, res, next);
        const mailData = {
            order: {
                _id: course._id?.toString()?.slice(0, 5),
                name: course.name,
                price: course.price,
                date: new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                }),
            },
        };
        const html = await ejs_1.default.renderFile(path_1.default.join(__dirname, "../views/order-confirmation.ejs"), mailData);
        try {
            if (user) {
                await (0, sendMail_1.default)({
                    email: user?.email,
                    subject: "Order Confirmation",
                    template: "order-confirmation.ejs",
                    data: mailData,
                });
            }
        }
        catch (error) {
            new ErrorHandler_1.default(error.message, error.statusCode);
        }
        user?.courses.push({
            courseId: course._id,
        });
        await user?.save();
        const notification = await notification_model_1.default.create({
            user: user?._id,
            title: "New Order",
            message: `You have a new order from ${course.name}`,
        });
        if (course.puchased) {
            course.puchased += 1;
        }
        else {
            course.puchased = 1;
        }
        await course.save();
        res.status(201).json({
            success: true,
            message: "Order created successfully",
            order: course,
        });
    }
    catch (error) {
        next(new ErrorHandler_1.default(error.message, error.statusCode));
    }
});
