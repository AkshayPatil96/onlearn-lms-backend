import { NextFunction, Request, Response } from "express";
import { CatchAsyncErrors } from "../middleware/catchAsyncErrors";
import {
  deleteCoursePermanentlyService,
  deleteCourseTemperoryService,
  getAllCoursesServices,
  retrieveDeletedCourseService,
} from "../services/course.service";
import { getAllOrdersService } from "../services/order.service";
import {
  deleteUserPermanentlySevice,
  deleteUserTemperorySevice,
  getAllUsersService,
  retrieveUserService,
  updateUserRoleService,
} from "../services/user.service";
import ErrorHandler from "../utils/ErrorHandler";

// ==================> User <==================

// get all users => /api/v1/admin/users (GET) (Admin)
export const getAllUsersByAdmin = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllUsersService(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  },
);

// update user role => /api/v1/admin/user/:id (PUT) (Admin)
export const updateUserRole = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { role } = req.body;

      updateUserRoleService(req.params.id, role, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  },
);

// delete user permanently => /api/v1/admin/user/delete-permanently/:id (DELETE) (Admin)
export const deleteUserPermanently = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      deleteUserPermanentlySevice(id, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  },
);

// delete user temperory => /api/v1/admin/user/delete-temperory/:id (DELETE) (Admin)
export const deleteUserTemperory = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      deleteUserTemperorySevice(id, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  },
);

// retrieve user => /api/v1/admin/user/retrieve/:id (GET) (Admin)
export const retrieveUser = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      retrieveUserService(id, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  },
);

// ========> COURSES <========

// get all courses => /api/v1/admin/courses (GET) (Admin)
export const getAllCoursesByAdmin = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllCoursesServices(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  },
);

// delete course temperory => /api/v1/admin/course/delete-temperory/:id (DELETE) (Admin)
export const deleteCourseTemperory = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      deleteCourseTemperoryService(id, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  },
);

// delete course permanently => /api/v1/admin/course/delete-permanently/:id (DELETE) (Admin)
export const deleteCoursePermanently = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      deleteCoursePermanentlyService(id, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  },
);

// retrieve course => /api/v1/admin/course/retrieve/:id (GET) (Admin)
export const retrieveCourse = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      retrieveDeletedCourseService(id, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  },
);

// ========> ORDERS <========

// get all orders   =>   /api/v1/admin/orders (Admin)
export const getAllOrdersByAdmin = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllOrdersService(res);
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.statusCode));
    }
  },
);
