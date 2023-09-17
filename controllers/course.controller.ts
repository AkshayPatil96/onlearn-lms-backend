import cloudinary from "cloudinary";
import ejs from "ejs";
import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import path from "path";
import redis from "../config/redis";
import { CatchAsyncErrors } from "../middleware/catchAsyncErrors";
import CourseModel from "../models/course.model";
import { createCourse } from "../services/course.service";
import ErrorHandler from "../utils/ErrorHandler";
import sendMail from "../utils/sendMail";

// upload course
export const uploadCourse = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;

      const thumbnail = data?.thumbnail;

      if (thumbnail) {
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });

        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      createCourse(data, res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// edit course
export const editCourse = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;

      const thumbnail = data?.thumbnail;

      if (thumbnail) {
        await cloudinary.v2.uploader.destroy(data.thumbnail.public_id);

        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });

        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      const course = await CourseModel.findByIdAndUpdate(
        req.params.id,
        { $set: data },
        {
          new: true,
        },
      );

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// get single course - without purchase
export const getSingleCourse = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.id;

      const isCached = await redis.get(courseId);

      if (isCached) {
        const course = JSON.parse(isCached);
        res.status(200).json({
          success: true,
          course,
        });
      } else {
        const course = await CourseModel.findById(req.params.id).select(
          "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links",
        );

        if (!course) {
          return next(new ErrorHandler("Course not found", 404));
        }

        await redis.set(courseId, JSON.stringify(course));

        res.status(200).json({
          success: true,
          course,
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// get all courses - without purchase
export const getAllCourses = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isCached = await redis.get("allCourses");

      if (isCached) {
        const courses = JSON.parse(isCached);
        res.status(200).json({
          success: true,
          courses,
        });
      } else {
        const courses = await CourseModel.find().select(
          "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links",
        );

        res.status(200).json({
          success: true,
          courses,
        });

        await redis.set("allCourses", JSON.stringify(courses));
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// get courses - only for valid user
export const getCourseByUser = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userCourseList = req?.user?.courses;
      const courseId = req.params.id;

      const courseExist = userCourseList?.find(
        (course: any) => course.courseId?.toString() === courseId,
      );

      if (!courseExist) {
        return next(
          new ErrorHandler("You are not eligible to access this course", 404),
        );
      }

      const course = await CourseModel.findById(courseId);

      const content = course?.courseData;

      res.status(200).json({
        success: true,
        content,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// add question to course
interface IQuestionData {
  question: string;
  courseId: string;
  contentId: string;
}
export const addQuestion = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { question, courseId, contentId }: IQuestionData = req.body;

      const course = await CourseModel.findById(courseId);

      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return next(new ErrorHandler("Invalid course id", 400));
      }

      const courseContent = course?.courseData?.find(
        (content: any) => content._id.toString() === contentId,
      );

      if (!courseContent) {
        return next(new ErrorHandler("Invalid content id", 400));
      }

      // create a new question object
      const newQuestion: any = {
        question,
        user: req.user?._id,
        questionReplies: [],
      };

      // push the question to the course content
      courseContent.questions.push(newQuestion);

      // save the course
      await course?.save();

      res.status(200).json({
        success: true,
        message: "Question added successfully",
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// add reply to question
interface IReplyData {
  reply: string;
  courseId: string;
  contentId: string;
  questionId: string;
}
export const addReply = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reply, courseId, contentId, questionId }: IReplyData = req.body;

      const course = await CourseModel.findById(courseId).populate(
        "courseData.questions.user",
      );

      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return next(new ErrorHandler("Invalid course id", 400));
      }

      const courseContent = course?.courseData?.find(
        (content: any) => content._id.toString() === contentId,
      );

      if (!courseContent) {
        return next(new ErrorHandler("Invalid content id", 400));
      }

      const question = courseContent?.questions?.find(
        (question: any) => question._id.toString() === questionId,
      );

      if (!question) {
        return next(new ErrorHandler("Invalid question id", 400));
      }

      // create a new reply object
      const newReply: any = {
        question: reply,
        user: req.user?._id,
      };

      // push the reply to the question
      question.questionReplies?.push(newReply);

      // save the course
      await course?.save();

      if (req.user?._id?.toString() === question?.user?._id?.toString()) {
        // create notification

        //
        res.status(200).json({
          success: true,
          message: "Reply added successfully",
          course,
        });
      } else {
        const data = {
          name: question?.user?.name,
          title: `"${courseContent?.title}" of ${course?.name}`,
        };

        const html = await ejs.renderFile(
          path.join(__dirname, "../views/reply.ejs"),
          data,
        );

        try {
          await sendMail({
            email: question?.user?.email,
            subject: "Reply to your question",
            template: "reply.ejs",
            data,
          });

          res.status(200).json({
            success: true,
            message: "Reply added successfully",
            course,
          });
        } catch (error: any) {
          return next(new ErrorHandler(error.message, 500));
        }
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// add review to course
interface IReviewData {
  rating: number;
  comment: string;
}
export const addReview = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { rating, comment }: IReviewData = req.body;
      const userCourseList = req?.user?.courses;
      const courseId = req.params.id;

      // check if courseId already exists in userCourseList based on _id
      const courseExist = userCourseList?.some(
        (course: any) => course.courseId?.toString() === courseId,
      );

      if (!courseExist) {
        return next(
          new ErrorHandler("You are not eligible to access this course", 404),
        );
      }

      const course = await CourseModel.findById(courseId);

      const reviewData: any = {
        user: req.user?._id,
        rating: Number(rating),
        comment,
        commentReplies: [],
      };

      console.log("reviewData: ", reviewData);

      // push the review to the course
      course?.reviews?.push(reviewData);

      let avg = 0;

      if (course?.reviews?.length) {
        avg =
          course?.reviews?.reduce(
            (acc: any, item: any) => item.rating + acc,
            0,
          ) / course?.reviews?.length;
      }

      if (course) {
        course.ratings = avg;
      }

      // save the course
      await course?.save();

      const notification = {
        title: "New Review Received",
        message: `You have received a new review for ${course?.name} from ${req.user?.name}`,
      };

      // create notification

      res.status(200).json({
        success: true,
        message: "Review added successfully",
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// add reply to review - only for admin
interface IReplyReviewData {
  comment: string;
  courseId: string;
  reviewId: string;
}
export const addReplyReview = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { comment, courseId, reviewId }: IReplyReviewData = req.body;

      const course = await CourseModel.findById(courseId).populate(
        "reviews.user",
      );

      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return next(new ErrorHandler("Invalid course id", 400));
      }

      if (!course) {
        return next(new ErrorHandler("Course not found", 404));
      }

      const review = course?.reviews?.find(
        (review: any) => review._id.toString() === reviewId,
      );

      if (!review) {
        return next(new ErrorHandler("Review not found", 400));
      }

      // create a new reply object
      const newReply: any = {
        comment,
        user: req.user?._id,
      };

      // push the reply to the review
      if (!review.commentReplies) {
        review.commentReplies = [];
      }
      review.commentReplies?.push(newReply);

      // save the course
      await course?.save();

      res.status(200).json({
        success: true,
        message: "Reply added successfully",
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);
