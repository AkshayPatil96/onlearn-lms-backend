"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNotification = exports.getNotifications = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const notification_model_1 = __importDefault(require("../models/notification.model"));
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
// Get all notifications => /api/v1/notifications (GET) (Admin)
exports.getNotifications = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const notification = await notification_model_1.default.find({}).sort({
            createdAt: -1,
        });
        res.status(200).json({
            success: true,
            notification,
        });
    }
    catch (err) {
        next(new ErrorHandler_1.default(err.message, 500));
    }
});
// update notification status => /api/v1/notification/:id (PUT) (Admin)
exports.updateNotification = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const notificationId = req.params.id;
        const notification = await notification_model_1.default.findById(notificationId);
        if (!notification) {
            return next(new ErrorHandler_1.default("Notification not found", 404));
        }
        notification.status = "read";
        await notification.save();
        const notifications = await notification_model_1.default.find({}).sort({
            createdAt: -1,
        });
        res.status(200).json({
            success: true,
            notifications,
        });
    }
    catch (err) {
        next(new ErrorHandler_1.default(err.message, 500));
    }
});
// delete notification => /api/v1/notification/:id (DELETE) (Admin)
node_cron_1.default.schedule("0 0 0 * * *", async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await notification_model_1.default.deleteMany({
        createdAt: { $lte: thirtyDaysAgo },
        status: "read",
    });
    console.log("Deleted read notifications");
});
