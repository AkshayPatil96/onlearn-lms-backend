import { NextFunction, Request, Response } from "express";
import cron from "node-cron";
import { CatchAsyncErrors } from "../middleware/catchAsyncErrors";
import NotificationModel from "../models/notification.model";
import ErrorHandler from "../utils/ErrorHandler";

// Get all notifications => /api/v1/notifications (GET) (Admin)
export const getNotifications = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notification = await NotificationModel.find({}).sort({
        createdAt: -1,
      });

      res.status(200).json({
        success: true,
        notification,
      });
    } catch (err: any) {
      next(new ErrorHandler(err.message, 500));
    }
  },
);

// update notification status => /api/v1/notification/:id (PUT) (Admin)
export const updateNotification = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notificationId = req.params.id;

      const notification = await NotificationModel.findById(notificationId);

      if (!notification) {
        return next(new ErrorHandler("Notification not found", 404));
      }

      notification.status = "read";

      await notification.save();

      const notifications = await NotificationModel.find({}).sort({
        createdAt: -1,
      });

      res.status(200).json({
        success: true,
        notifications,
      });
    } catch (err: any) {
      next(new ErrorHandler(err.message, 500));
    }
  },
);

// delete notification => /api/v1/notification/:id (DELETE) (Admin)
cron.schedule("0 0 0 * * *", async () => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  await NotificationModel.deleteMany({
    createdAt: { $lte: thirtyDaysAgo },
    status: "read",
  });
  console.log("Deleted read notifications");
});
