import cloudinary from "cloudinary";
import { NextFunction, Request, Response } from "express";
import redis from "../config/redis";
import { CatchAsyncErrors } from "../middleware/catchAsyncErrors";
import UserModel from "../models/user.model";
import {
  deleteUserTemperorySevice,
  getAllUsersService,
  getUserById,
  retrieveUserService,
} from "../services/user.service";
import ErrorHandler from "../utils/ErrorHandler";
import cron from "node-cron";
import { error } from "console";

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
          }
          let image = await cloudinary.v2.uploader.upload(avatar, {
            folder: "avatar",
            width: 150,
          });

          console.log("image: ", image);
          user.avatar = {
            public_id: image.public_id,
            url: image.secure_url,
          };

          await user.save();

          await redis.set(user?._id, JSON.stringify(user));
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

// delete user temperory => /api/v1/user/delete-temperory (DELETE) (user)
export const deleteUserTemperory = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      deleteUserTemperorySevice(req.user?._id, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  },
);

// cron job to delete user after 14 days of temperory deletion
cron.schedule("0 0 */14 * *", async () => {
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  await UserModel.deleteMany({
    updatedAt: { $lte: fourteenDaysAgo },
    isDeleted: true,
  });
  console.log("Deleted users");

  await redis.flushall();

  console.log("Flushed redis");
});

// retrieve temperory deleted user => /api/v1/users/retrieve (GET) (user)
export const retrieveTemperoryDeletedUser = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      retrieveUserService(req.user?._id as string, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  },
);
