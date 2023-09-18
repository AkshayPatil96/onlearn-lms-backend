import { Response } from "express";
import CourseModel from "../models/course.model";
import { CatchAsyncErrors } from "../middleware/catchAsyncErrors";

// create course
export const createCourse = CatchAsyncErrors(
  async (data: any, res: Response) => {
    const course = await CourseModel.create(data);

    res.status(201).json({
      success: true,
      course,
    });
  },
);

// get all courses
export const getAllCoursesServices = async (res: Response) => {
  const courses = await CourseModel.find({
    isDeleted: false,
  }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    courses,
  });
};

// delete course temperory
export const deleteCourseTemperoryService = async (
  id: string,
  res: Response,
) => {
  const course = await CourseModel.findOne({ _id: id, isDeleted: false });

  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found",
    });
  }

  course.isDeleted = true;

  await course.save();

  res.status(200).json({
    success: true,
    message: "Course deleted temperory",
  });
};

// delete course permanently
export const deleteCoursePermanentlyService = async (
  id: string,
  res: Response,
) => {
  const course = await CourseModel.findOne({ _id: id, isDeleted: true });

  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found",
    });
  }

  await course.deleteOne();

  res.status(200).json({
    success: true,
    message: "Course deleted permanently",
  });
};

// retrieve course
export const retrieveDeletedCourseService = async (
  id: string,
  res: Response,
) => {
  const course = await CourseModel.findOne({
    _id: id,
    isDeleted: true,
  });

  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found",
    });
  }

  course.isDeleted = false;

  await course.save();

  res.status(200).json({
    success: true,
    course,
  });
};
