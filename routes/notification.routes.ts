import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import {
  getNotifications,
  updateNotification,
} from "../controllers/notification.controller";

const notificationRouter = express.Router();

notificationRouter.get(
  "/",
  isAuthenticated,
  authorizeRoles("admin"),
  getNotifications,
);

notificationRouter.put(
  "/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  updateNotification,
);

export default notificationRouter;
