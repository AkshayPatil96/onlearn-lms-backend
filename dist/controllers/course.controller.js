"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveCourse = exports.deleteCourse = exports.addReplyReview = exports.addReview = exports.addReply = exports.addQuestion = exports.getCourseByUser = exports.getAllCourses = exports.getSingleCourse = exports.editCourse = exports.uploadCourse = void 0;
const cloudinary_1 = __importDefault(require("cloudinary"));
const ejs_1 = __importDefault(require("ejs"));
const mongoose_1 = __importDefault(require("mongoose"));
const path_1 = __importDefault(require("path"));
const redis_1 = __importDefault(require("../config/redis"));
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const course_model_1 = __importDefault(require("../models/course.model"));
const course_service_1 = require("../services/course.service");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const sendMail_1 = __importDefault(require("../utils/sendMail"));
const notification_model_1 = __importDefault(require("../models/notification.model"));
// upload course - only for course creator
exports.uploadCourse = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const data = req.body;
        const thumbnail = data?.thumbnail;
        if (thumbnail) {
            const myCloud = await cloudinary_1.default.v2.uploader.upload(thumbnail, {
                folder: "courses",
            });
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }
        data.user = req.user?._id;
        (0, course_service_1.createCourse)(data, res, next);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// edit course - only for course creator and access users
exports.editCourse = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const data = req.body;
        const thumbnail = data?.thumbnail;
        if (thumbnail) {
            await cloudinary_1.default.v2.uploader.destroy(data.thumbnail.public_id);
            const myCloud = await cloudinary_1.default.v2.uploader.upload(thumbnail, {
                folder: "courses",
            });
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }
        const course = await course_model_1.default.findOneAndUpdate({
            _id: req.params.id,
            isDeleted: false,
            $or: [{ user: req.user?._id }, { editAccess: req.user?._id }],
        }, { $set: data }, {
            new: true,
        });
        res.status(200).json({
            success: true,
            course,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// get single course - without purchase
exports.getSingleCourse = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const courseId = req.params.id;
        const isCached = await redis_1.default.get(courseId);
        if (isCached) {
            const course = JSON.parse(isCached);
            // check if course is deleted
            if (course.isDeleted) {
                return next(new ErrorHandler_1.default("Course not found", 404));
            }
            res.status(200).json({
                success: true,
                course,
            });
        }
        else {
            const course = await course_model_1.default.findOne({
                _id: courseId,
                isDeleted: false,
            }).select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");
            if (!course) {
                return next(new ErrorHandler_1.default("Course not found", 404));
            }
            await redis_1.default.set(courseId, JSON.stringify(course), "EX", 60 * 60 * 24 * 7);
            res.status(200).json({
                success: true,
                course,
            });
        }
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// get all courses - without purchase
exports.getAllCourses = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const isCached = await redis_1.default.get("allCourses");
        if (isCached) {
            const courses = JSON.parse(isCached);
            // check if course is deleted
            const filteredCourses = courses.filter((course) => course.isDeleted === false);
            res.status(200).json({
                success: true,
                courses: filteredCourses,
            });
        }
        else {
            const courses = await course_model_1.default.find({ isDeleted: false }).select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");
            res.status(200).json({
                success: true,
                courses,
            });
            await redis_1.default.set("allCourses", JSON.stringify(courses));
        }
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// get courses - only for valid user
exports.getCourseByUser = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const userCourseList = req?.user?.courses;
        const courseId = req.params.id;
        const courseExist = userCourseList?.find((course) => course.courseId?.toString() === courseId);
        if (!courseExist) {
            return next(new ErrorHandler_1.default("You are not eligible to access this course", 404));
        }
        const course = await course_model_1.default.findOne({
            _id: courseId,
            isDeleted: false,
        });
        const content = course?.courseData;
        res.status(200).json({
            success: true,
            content,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
exports.addQuestion = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const { question, courseId, contentId } = req.body;
        const course = await course_model_1.default.findOne({
            _id: courseId,
            isDeleted: false,
        });
        if (!mongoose_1.default.Types.ObjectId.isValid(courseId)) {
            return next(new ErrorHandler_1.default("Invalid course id", 400));
        }
        const courseContent = course?.courseData?.find((content) => content._id.toString() === contentId && !content.isDeleted);
        if (!courseContent) {
            return next(new ErrorHandler_1.default("Invalid content id", 400));
        }
        // create a new question object
        const newQuestion = {
            question,
            user: req.user?._id,
            questionReplies: [],
        };
        // push the question to the course content
        courseContent.questions.push(newQuestion);
        // send notification to admin
        await notification_model_1.default.create({
            title: "New Question Received",
            message: `You have received a new question for ${courseContent?.title} of ${course?.name} from ${req.user?.name}`,
            user: req.user?._id,
        });
        // save the course
        await course?.save();
        res.status(200).json({
            success: true,
            message: "Question added successfully",
            course,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
exports.addReply = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const { reply, courseId, contentId, questionId } = req.body;
        const course = await course_model_1.default.findOne({
            _id: courseId,
            isDeleted: false,
        }).populate("courseData.questions.user");
        if (!mongoose_1.default.Types.ObjectId.isValid(courseId)) {
            return next(new ErrorHandler_1.default("Invalid course id", 400));
        }
        const courseContent = course?.courseData?.find((content) => content._id.toString() === contentId && !content.isDeleted);
        if (!courseContent) {
            return next(new ErrorHandler_1.default("Invalid content id", 400));
        }
        const question = courseContent?.questions?.find((question) => question._id.toString() === questionId);
        if (!question) {
            return next(new ErrorHandler_1.default("Invalid question id", 400));
        }
        // create a new reply object
        const newReply = {
            question: reply,
            user: req.user?._id,
        };
        // push the reply to the question
        question.questionReplies?.push(newReply);
        // save the course
        await course?.save();
        if (req.user?._id?.toString() === question?.user?._id?.toString()) {
            // create notification
            await notification_model_1.default.create({
                title: "New Reply Received",
                message: `You have received a new reply for your question for ${courseContent?.title} of ${course?.name} from ${req.user?.name}`,
                user: req.user?._id,
            });
            res.status(200).json({
                success: true,
                message: "Reply added successfully",
                course,
            });
        }
        else {
            const data = {
                name: question?.user?.name,
                title: `"${courseContent?.title}" of ${course?.name}`,
            };
            const html = await ejs_1.default.renderFile(path_1.default.join(__dirname, "../views/reply.ejs"), data);
            try {
                await (0, sendMail_1.default)({
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
            }
            catch (error) {
                return next(new ErrorHandler_1.default(error.message, 500));
            }
        }
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
exports.addReview = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const { rating, comment } = req.body;
        const userCourseList = req?.user?.courses;
        const courseId = req.params.id;
        // check if courseId already exists in userCourseList based on _id
        const courseExist = userCourseList?.some((course) => course.courseId?.toString() === courseId);
        if (!courseExist) {
            return next(new ErrorHandler_1.default("You are not eligible to access this course", 404));
        }
        const course = await course_model_1.default.findOne({
            _id: courseId,
            isDeleted: false,
        });
        const reviewData = {
            user: req.user?._id,
            rating: Number(rating),
            comment,
            commentReplies: [],
        };
        // push the review to the course
        course?.reviews?.push(reviewData);
        let avg = 0;
        if (course?.reviews?.length) {
            avg =
                course?.reviews?.reduce((acc, item) => item.rating + acc, 0) / course?.reviews?.length;
        }
        if (course) {
            course.ratings = avg;
        }
        // save the course
        await course?.save();
        // create notification
        const notification = {
            title: "New Review Received",
            message: `You have received a new review for ${course?.name} from ${req.user?.name}`,
        };
        await notification_model_1.default.create({
            ...notification,
            user: req.user?._id,
        });
        res.status(200).json({
            success: true,
            message: "Review added successfully",
            course,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
exports.addReplyReview = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const { comment, courseId, reviewId } = req.body;
        const course = await course_model_1.default.findOne({
            _id: courseId,
            isDeleted: false,
        }).populate("reviews.user");
        if (!mongoose_1.default.Types.ObjectId.isValid(courseId)) {
            return next(new ErrorHandler_1.default("Invalid course id", 400));
        }
        if (!course) {
            return next(new ErrorHandler_1.default("Course not found", 404));
        }
        const review = course?.reviews?.find((review) => review._id.toString() === reviewId);
        if (!review) {
            return next(new ErrorHandler_1.default("Review not found", 400));
        }
        // create a new reply object
        const newReply = {
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
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// delete course => api/v1/course/delete/:id (DELETE) (course creator)
exports.deleteCourse = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const userId = req.user?._id;
        const { id } = req.params;
        const course = await course_model_1.default.findOne({
            _id: id,
            isDeleted: false,
            user: userId,
        });
        if (!course) {
            return next(new ErrorHandler_1.default("You dont have permission to access this course", 404));
        }
        else {
            (0, course_service_1.deleteCourseTemperoryService)(id, res);
        }
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// retrieve course => api/v1/course/retrieve/:id (GET) (course creator)
exports.retrieveCourse = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const userId = req.user?._id;
        const { id } = req.params;
        const course = await course_model_1.default.findOne({
            _id: id,
            isDeleted: true,
            user: userId,
        });
        if (!course) {
            next(new ErrorHandler_1.default("You dont have permission to access this course", 404));
        }
        else {
            (0, course_service_1.retrieveDeletedCourseService)(id, res);
        }
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
