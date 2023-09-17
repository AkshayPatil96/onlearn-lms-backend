import { Response, Request, NextFunction } from "express";
import { CatchAsyncErrors } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import OrderModel, { IOrder } from "../models/order.model";
import UserModel from "../models/user.model";
import CourseModel from "../models/course.model";
import path from "path";
import ejs from "ejs";
import Notification from "../models/notification.model";
import sendMail from "../utils/sendMail";
import { newOrder } from "../services/order.service";

// create order   =>   /api/v1/order/new
export const createOrder = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId, payment_info } = req.body as IOrder;

      const user = await UserModel.findById(req.user?._id);

      const courseExistInUser = user?.courses.find(
        (course: any) => course.courseId.toString() === courseId,
      );

      if (courseExistInUser) {
        return next(
          new ErrorHandler("You have already purchased this course", 400),
        );
      }

      const course = await CourseModel.findById(courseId);

      if (!course) {
        return next(new ErrorHandler("Course not found", 404));
      }

      const data: any = {
        user: req.user?._id,
        courseId: course._id,
      };

      newOrder(data, res, next);

      const mailData = {
        order: {
          _id: course._id.slice(0, 5),
          name: course.name,
          price: course.price,
          date: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        },
      };
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.statusCode));
    }
  },
);
