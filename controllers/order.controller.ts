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
import { getAllOrdersService, newOrder } from "../services/order.service";

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

      const course = await CourseModel.findOne({
        _id: courseId,
        isDeleted: false,
      });

      if (!course) {
        return next(new ErrorHandler("Course not found", 404));
      }

      const data: any = {
        user: req.user?._id,
        courseId: course._id,
        payment_info,
      };

      newOrder(data, res, next);

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

      const html = await ejs.renderFile(
        path.join(__dirname, "../views/order-confirmation.ejs"),
        mailData,
      );

      try {
        if (user) {
          await sendMail({
            email: user?.email,
            subject: "Order Confirmation",
            template: "order-confirmation.ejs",
            data: mailData,
          });
        }
      } catch (error: any) {
        new ErrorHandler(error.message, error.statusCode);
      }

      user?.courses.push({
        courseId: course._id,
      });

      await user?.save();

      const notification = await Notification.create({
        user: user?._id,
        title: "New Order",
        message: `You have a new order from ${course.name}`,
      });

      if (course.puchased) {
        course.puchased += 1;
      } else {
        course.puchased = 1;
      }

      await course.save();

      res.status(201).json({
        success: true,
        message: "Order created successfully",
        order: course,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.statusCode));
    }
  },
);
