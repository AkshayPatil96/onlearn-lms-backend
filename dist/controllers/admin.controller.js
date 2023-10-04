"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllOrdersByAdmin = exports.retrieveCourse = exports.deleteCoursePermanently = exports.deleteCourseTemperory = exports.getAllCoursesByAdmin = exports.retrieveUser = exports.deleteUserTemperory = exports.deleteUserPermanently = exports.updateUserRole = exports.getAllUsersByAdmin = void 0;
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const course_service_1 = require("../services/course.service");
const order_service_1 = require("../services/order.service");
const user_service_1 = require("../services/user.service");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
// ==================> User <==================
// get all users => /api/v1/admin/users (GET) (Admin)
exports.getAllUsersByAdmin = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        (0, user_service_1.getAllUsersService)(res);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
// update user role => /api/v1/admin/user/:id (PUT) (Admin)
exports.updateUserRole = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const { role } = req.body;
        (0, user_service_1.updateUserRoleService)(req.params.id, role, res);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
// delete user permanently => /api/v1/admin/user/delete-permanently/:id (DELETE) (Admin)
exports.deleteUserPermanently = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const { id } = req.params;
        (0, user_service_1.deleteUserPermanentlySevice)(id, res);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
// delete user temperory => /api/v1/admin/user/delete-temperory/:id (DELETE) (Admin)
exports.deleteUserTemperory = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const { id } = req.params;
        (0, user_service_1.deleteUserTemperorySevice)(id, res);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
// retrieve user => /api/v1/admin/user/retrieve/:id (GET) (Admin)
exports.retrieveUser = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const { id } = req.params;
        (0, user_service_1.retrieveUserService)(id, res);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
// ========> COURSES <========
// get all courses => /api/v1/admin/courses (GET) (Admin)
exports.getAllCoursesByAdmin = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        (0, course_service_1.getAllCoursesServices)(res);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
// delete course temperory => /api/v1/admin/course/delete-temperory/:id (DELETE) (Admin)
exports.deleteCourseTemperory = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const { id } = req.params;
        (0, course_service_1.deleteCourseTemperoryService)(id, res);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
// delete course permanently => /api/v1/admin/course/delete-permanently/:id (DELETE) (Admin)
exports.deleteCoursePermanently = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const { id } = req.params;
        (0, course_service_1.deleteCoursePermanentlyService)(id, res);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
// retrieve course => /api/v1/admin/course/retrieve/:id (GET) (Admin)
exports.retrieveCourse = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const { id } = req.params;
        (0, course_service_1.retrieveDeletedCourseService)(id, res);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
// ========> ORDERS <========
// get all orders   =>   /api/v1/admin/orders (Admin)
exports.getAllOrdersByAdmin = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        (0, order_service_1.getAllOrdersService)(res);
    }
    catch (error) {
        next(new ErrorHandler_1.default(error.message, error.statusCode));
    }
});
