import { NextFunction, Response } from "express";
import { CatchAsyncErrors } from "../middleware/catchAsyncErrors";
import Order from "../models/order.model";

// create new order
export const newOrder = CatchAsyncErrors(
  async (data: any, next: NextFunction) => {
    const order = await Order.create(data);
    return order;
  },
);

// get all orders
export const getAllOrdersService = async (res: Response) => {
  const orders = await Order.find({}).sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    orders,
  });
};
