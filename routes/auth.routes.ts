import express from "express";
import {
  activateUserAccount,
  loginUser,
  logoutUser,
  registerUser,
  socialLogin,
  updateRefreshToken,
} from "../controllers/auth.controller";
import { isAuthenticated } from "../middleware/auth";

const authRoute = express.Router();

authRoute.post("/register", registerUser);
authRoute.post("/activate-user", activateUserAccount);
authRoute.post("/login", loginUser);
authRoute.get("/logout", isAuthenticated, logoutUser);
authRoute.get("/refresh-token", updateRefreshToken);
authRoute.post("/social-auth", socialLogin);

export default authRoute;
