import { NextFunction } from "express";
import { CatchAsyncErrors } from "../middleware/catchAsyncErrors";
import Order from "../models/order.model";

// create new order
export const newOrder = CatchAsyncErrors(
  async (data: any, next: NextFunction) => {
    const order = await Order.create(data);
    next(order);
  },
);
