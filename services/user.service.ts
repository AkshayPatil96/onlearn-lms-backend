import { Response } from "express";
import UserModel from "../models/user.model";
import redis from "../config/redis";

// get user by id
export const getUserById = async (id: string, res: Response) => {
  // const user = await UserModel.findById(id);
  const userJson = await redis.get(id);
  const user = JSON.parse(userJson as string);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // if (user.isDeleted) {
  //   return res.status(404).json({
  //     success: false,
  //     message: "User not found",
  //   });
  // }

  res.status(200).json({
    success: true,
    user,
  });
};

// get all users
export const getAllUsersService = async (res: Response) => {
  const users = await UserModel.find({
    isDeleted: false,
  }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    users,
  });
};

// update user role
export const updateUserRoleService = async (
  id: string,
  role: string,
  res: Response,
) => {
  const user = await UserModel.findOneAndUpdate(
    {
      _id: id,
      isDeleted: false,
    },
    { role },
    { new: true },
  );

  await redis.set(user?._id, JSON.stringify(user));

  res.status(200).json({
    success: true,
    user,
  });
};

// delete user temperory
export const deleteUserTemperorySevice = async (id: string, res: Response) => {
  const user = await UserModel.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  user.isDeleted = true;

  await user.save();

  await redis.set(user?._id, JSON.stringify(user));

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
};

// delete user permanently
export const deleteUserPermanentlySevice = async (
  id: string,
  res: Response,
) => {
  const user = await UserModel.findOne({
    _id: id,
    isDeleted: true,
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  await user.deleteOne();

  await redis.del(user?._id);

  res.status(200).json({
    success: true,
    message: "User deleted permanently",
  });
};

// retrieve user
export const retrieveUserService = async (id: string, res: Response) => {
  const user = await UserModel.findById(id);

  if (user && user.isDeleted) {
    user.isDeleted = false;

    await user.save();

    await redis.set(user?._id, JSON.stringify(user));

    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      user,
    });
  }
};
