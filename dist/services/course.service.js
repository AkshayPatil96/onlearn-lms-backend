"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveDeletedCourseService = exports.deleteCoursePermanentlyService = exports.deleteCourseTemperoryService = exports.getAllCoursesServices = exports.createCourse = void 0;
const course_model_1 = __importDefault(require("../models/course.model"));
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
// create course
exports.createCourse = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (data, res) => {
    const course = await course_model_1.default.create(data);
    res.status(201).json({
        success: true,
        course,
    });
});
// get all courses
const getAllCoursesServices = async (res) => {
    const courses = await course_model_1.default.find({
        isDeleted: false,
    }).sort({
        createdAt: -1,
    });
    res.status(200).json({
        success: true,
        courses,
    });
};
exports.getAllCoursesServices = getAllCoursesServices;
// delete course temperory
const deleteCourseTemperoryService = async (id, res) => {
    const course = await course_model_1.default.findOne({ _id: id, isDeleted: false });
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
exports.deleteCourseTemperoryService = deleteCourseTemperoryService;
// delete course permanently
const deleteCoursePermanentlyService = async (id, res) => {
    const course = await course_model_1.default.findOne({ _id: id, isDeleted: true });
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
exports.deleteCoursePermanentlyService = deleteCoursePermanentlyService;
// retrieve course
const retrieveDeletedCourseService = async (id, res) => {
    const course = await course_model_1.default.findOne({
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
exports.retrieveDeletedCourseService = retrieveDeletedCourseService;
