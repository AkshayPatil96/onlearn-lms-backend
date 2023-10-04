"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const admin_controller_1 = require("../controllers/admin.controller");
const adminRouter = express_1.default.Router();
// ==========> USERS <==========
adminRouter.get("/users", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), admin_controller_1.getAllUsersByAdmin);
adminRouter.put("/user/:id", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), admin_controller_1.updateUserRole);
adminRouter.delete("/user/delete-temperory/:id", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), admin_controller_1.deleteUserTemperory);
adminRouter.delete("/user/delete-permanently/:id", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), admin_controller_1.deleteUserPermanently);
adminRouter.get("/user/retrieve/:id", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), admin_controller_1.retrieveUser);
// ==========> COURSES <==========
adminRouter.get("/courses", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), admin_controller_1.getAllCoursesByAdmin);
adminRouter.delete("/course/delete-temperory/:id", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), admin_controller_1.deleteCourseTemperory);
adminRouter.delete("/course/delete-permanently/:id", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), admin_controller_1.deleteCoursePermanently);
adminRouter.get("/course/retrieve/:id", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), admin_controller_1.retrieveCourse);
// ==========> ORDERS <==========
adminRouter.get("/orders", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), admin_controller_1.getAllOrdersByAdmin);
exports.default = adminRouter;
