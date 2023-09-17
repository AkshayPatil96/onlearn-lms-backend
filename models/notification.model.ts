import mongoose, { Document, Model, Schema } from "mongoose";
import { IUser } from "./user.model";

export interface INotification extends Document {
  user: IUser;
  title: string;
  message: string;
  status: string;
}

const notificationSchema = new Schema<INotification>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "unread",
    },
  },
  { timestamps: true },
);

const Notification: Model<INotification> = mongoose.model(
  "Notification",
  notificationSchema,
);

export default Notification;
