import express from "express";
import {
  getUserInfo,
  updateUserAvatar,
  updateUserInfo,
  updateUserPassword,
} from "../controllers/user.controller";
import { isAuthenticated } from "../middleware/auth";

const userRoute = express.Router();

userRoute.get("/me", isAuthenticated, getUserInfo);
userRoute.put("/update", isAuthenticated, updateUserInfo);
userRoute.put("/update-password", isAuthenticated, updateUserPassword);
userRoute.put("/update-avatar", isAuthenticated, updateUserAvatar);

export default userRoute;
