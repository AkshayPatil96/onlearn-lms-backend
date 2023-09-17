import cloudinary from "cloudinary";
import { NextFunction, Request, Response } from "express";
import redis from "../config/redis";
import { CatchAsyncErrors } from "../middleware/catchAsyncErrors";
import UserModel from "../models/user.model";
import { getUserById } from "../services/user.service";
import ErrorHandler from "../utils/ErrorHandler";

// get user info
export const getUserInfo = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;

      getUserById(userId as string, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  },
);

// update user info
interface IUpdateUserInfo {
  name: string;
  email: string;
}
export const updateUserInfo = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email } = req.body as IUpdateUserInfo;
      const userId = req.user?._id;

      const user = await UserModel.findById(userId);

      if (user && email) {
        const emailExist = await UserModel.findOne({ email });

        if (emailExist) {
          return next(new ErrorHandler("Email already exist", 400));
        }
        user.email = email;
      }

      if (user && name) {
        user.name = name;
      }

      await user?.save();

      await redis.set(user?._id, JSON.stringify(user));

      res.status(200).json({
        success: true,
        message: "User updated successfully",
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  },
);

// update user password
interface IUpdateUserPassword {
  oldPassword: string;
  newPassword: string;
}
export const updateUserPassword = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { oldPassword, newPassword } = req.body as IUpdateUserPassword;

      if (!oldPassword || !newPassword) {
        return next(
          new ErrorHandler("Please provide old and new password", 400),
        );
      }

      const user = await UserModel.findById(req.user?._id).select("+password");

      if (user) {
        if (user?.password === undefined) {
          return next(new ErrorHandler("Invalid user", 404));
        }

        const isMatch = await user.comparePassword(oldPassword);

        if (!isMatch) {
          return next(new ErrorHandler("Old password is invalid", 400));
        }

        user.password = newPassword;

        await user.save();

        await redis.set(user?._id, JSON.stringify(user));

        res.status(200).json({
          success: true,
          message: "Password updated successfully",
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  },
);

// update user avatar
interface IUpdateUserAvatar {
  avatar: string;
}
export const updateUserAvatar = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { avatar } = req.body as IUpdateUserAvatar;

      const user = await UserModel.findById(req.user?._id);

      if (avatar) {
        if (user) {
          if (user?.avatar?.public_id) {
            await cloudinary.v2.uploader.destroy(user.avatar.public_id);
          } else {
            let image = await cloudinary.v2.uploader.upload(avatar, {
              folder: "avatar",
              width: 150,
            });

            user.avatar = {
              public_id: image.public_id,
              url: image.secure_url,
            };

            await user.save();

            await redis.set(user?._id, JSON.stringify(user));
          }
        }
      } else {
        return next(new ErrorHandler("Please provide an image", 400));
      }

      res.status(200).json({
        success: true,
        message: "Avatar updated successfully",
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  },
);
