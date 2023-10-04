"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middleware/auth");
const authRoute = express_1.default.Router();
authRoute.post("/register", auth_controller_1.registerUser);
authRoute.post("/activate-user", auth_controller_1.activateUserAccount);
authRoute.post("/login", auth_controller_1.loginUser);
authRoute.get("/logout", auth_1.isAuthenticated, auth_controller_1.logoutUser);
authRoute.get("/refresh-token", auth_controller_1.updateRefreshToken);
authRoute.post("/social-auth", auth_controller_1.socialLogin);
exports.default = authRoute;
