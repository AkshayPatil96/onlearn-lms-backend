import { Response } from "express";
import UserModel from "../models/user.model";
import redis from "../config/redis";

// get user by id
export const getUserById = async (id: string, res: Response) => {
  // const user = await UserModel.findById(id);
  const userJson = await redis.get(id);
  const user = JSON.parse(userJson as string);

  res.status(200).json({
    success: true,
    user,
  });
};
