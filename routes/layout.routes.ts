import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import {
  createLayout,
  editLayout,
  getLayoutByType,
} from "../controllers/layout.controller";

const layoutRouter = express.Router();

layoutRouter.post("/", isAuthenticated, authorizeRoles("admin"), createLayout);
layoutRouter.put("/", isAuthenticated, authorizeRoles("admin"), editLayout);
layoutRouter.get("/:type", isAuthenticated, getLayoutByType);

export default layoutRouter;
