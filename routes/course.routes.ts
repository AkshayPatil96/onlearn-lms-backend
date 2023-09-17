import express from "express";
import {
  addQuestion,
  addReply,
  addReplyReview,
  addReview,
  editCourse,
  getAllCourses,
  getCourseByUser,
  getSingleCourse,
  uploadCourse,
} from "../controllers/course.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";

const courseRouter = express.Router();

courseRouter.post(
  "/upload",
  isAuthenticated,
  authorizeRoles("admin"),
  uploadCourse,
);
courseRouter.put(
  "/edit/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  editCourse,
);
courseRouter.get("/:id", getSingleCourse);
courseRouter.get("/", getAllCourses);

courseRouter.get("/content/:id", isAuthenticated, getCourseByUser);

courseRouter.put("/add-question", isAuthenticated, addQuestion);
courseRouter.put("/add-answer", isAuthenticated, addReply);

courseRouter.put("/add-review/:id", isAuthenticated, addReview);
courseRouter.put(
  "/add-review-reply",
  isAuthenticated,
  authorizeRoles("admin"),
  addReplyReview,
);

export default courseRouter;
