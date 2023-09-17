import mongoose, { Document, Model, Schema } from "mongoose";
import { IUser } from "./user.model";
import { ICourse } from "./course.model";

export interface IOrder extends Document {
  user: IUser;
  courseId: ICourse;
  payment_info: object;
}

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    payment_info: {
      type: Object,
      required: true,
    },
  },
  { timestamps: true },
);

const Order: Model<IOrder> = mongoose.model("Order", orderSchema);

export default Order;
