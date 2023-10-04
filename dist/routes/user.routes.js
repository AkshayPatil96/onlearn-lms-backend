"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const auth_1 = require("../middleware/auth");
const userRoute = express_1.default.Router();
userRoute.get("/me", auth_1.isAuthenticated, user_controller_1.getUserInfo);
userRoute.put("/update", auth_1.isAuthenticated, user_controller_1.updateUserInfo);
userRoute.put("/update-password", auth_1.isAuthenticated, user_controller_1.updateUserPassword);
userRoute.put("/update-avatar", auth_1.isAuthenticated, user_controller_1.updateUserAvatar);
userRoute.delete("/delete-temperory", auth_1.isAuthenticated, user_controller_1.deleteUserTemperory);
userRoute.get("/retrieve", auth_1.isAuthenticated, user_controller_1.retrieveTemperoryDeletedUser);
exports.default = userRoute;
