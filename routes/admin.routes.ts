import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import {
  deleteCoursePermanently,
  deleteCourseTemperory,
  deleteUserPermanently,
  deleteUserTemperory,
  getAllCoursesByAdmin,
  getAllOrdersByAdmin,
  getAllUsersByAdmin,
  retrieveCourse,
  retrieveUser,
  updateUserRole,
} from "../controllers/admin.controller";

const adminRouter = express.Router();

// ==========> USERS <==========

adminRouter.get(
  "/users",
  isAuthenticated,
  authorizeRoles("admin"),
  getAllUsersByAdmin,
);

adminRouter.put(
  "/user/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  updateUserRole,
);

adminRouter.delete(
  "/user/delete-temperory/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  deleteUserTemperory,
);

adminRouter.delete(
  "/user/delete-permanently/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  deleteUserPermanently,
);

adminRouter.get(
  "/user/retrieve/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  retrieveUser,
);

// ==========> COURSES <==========

adminRouter.get(
  "/courses",
  isAuthenticated,
  authorizeRoles("admin"),
  getAllCoursesByAdmin,
);

adminRouter.delete(
  "/course/delete-temperory/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  deleteCourseTemperory,
);

adminRouter.delete(
  "/course/delete-permanently/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  deleteCoursePermanently,
);

adminRouter.get(
  "/course/retrieve/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  retrieveCourse,
);

// ==========> ORDERS <==========

adminRouter.get(
  "/orders",
  isAuthenticated,
  authorizeRoles("admin"),
  getAllOrdersByAdmin,
);

export default adminRouter;
