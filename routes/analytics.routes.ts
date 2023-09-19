import express from "express";
import {
  getCourseAnalytics,
  getOrderAnalytics,
  getUserAnalytics,
} from "../controllers/analytics.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";

const analyticsRouter = express.Router();

analyticsRouter.get(
  "/users",
  isAuthenticated,
  authorizeRoles("admin"),
  getUserAnalytics,
);
analyticsRouter.get(
  "/courses",
  isAuthenticated,
  authorizeRoles("admin"),
  getCourseAnalytics,
);
analyticsRouter.get(
  "/orders",
  isAuthenticated,
  authorizeRoles("admin"),
  getOrderAnalytics,
);

export default analyticsRouter;
