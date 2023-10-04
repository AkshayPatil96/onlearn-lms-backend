"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socialLogin = exports.updateRefreshToken = exports.logoutUser = exports.loginUser = exports.activateUserAccount = exports.createActivationToken = exports.registerUser = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const redis_1 = __importDefault(require("../config/redis"));
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const user_model_1 = __importDefault(require("../models/user.model"));
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const jwt_1 = require("../utils/jwt");
const sendMail_1 = __importDefault(require("../utils/sendMail"));
const cloudinary_1 = __importDefault(require("cloudinary"));
dotenv_1.default.config();
// register a new user
exports.registerUser = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    const { name, email, password, avatar } = req.body;
    try {
        // Check email is already registered
        const isEmailExist = await user_model_1.default.findOne({ email });
        if (isEmailExist) {
            return next(new ErrorHandler_1.default("Email already exists", 400));
        }
        // Create new user
        const user = {
            name,
            email,
            password,
        };
        const activationToken = (0, exports.createActivationToken)(user);
        const activationCode = activationToken.activationCode;
        const data = { user: { name: user.name }, activationCode };
        try {
            await (0, sendMail_1.default)({
                email: user.email,
                subject: "Account Activation",
                template: "activation-mail.ejs",
                data,
            });
            res.status(201).json({
                success: true,
                message: "Account created successfully. Please check your email to activate your account.",
                activationToken: activationToken.token,
            });
        }
        catch (error) {
            return next(new ErrorHandler_1.default(error.message, 400));
        }
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
// create activation token
const createActivationToken = (user) => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const token = jsonwebtoken_1.default.sign({
        user,
        activationCode,
    }, process.env.JWT_SECRET, {
        expiresIn: "5m",
    });
    return { token, activationCode };
};
exports.createActivationToken = createActivationToken;
// activate user account
exports.activateUserAccount = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const { activationCode, activationToken } = req.body;
        const newUser = jsonwebtoken_1.default.verify(activationToken, process.env.JWT_SECRET);
        if (newUser.activationCode !== activationCode) {
            return next(new ErrorHandler_1.default("Invalid activation code", 400));
        }
        const { name, email, password } = newUser.user;
        const existingUser = await user_model_1.default.findOne({ email });
        if (existingUser) {
            return next(new ErrorHandler_1.default("Email already exists", 400));
        }
        const user = await user_model_1.default.create({
            name,
            email,
            password,
        });
        res.status(200).json({
            success: true,
            message: "Account activated successfully",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
exports.loginUser = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new ErrorHandler_1.default("Please enter email & password", 400));
        }
        const user = await user_model_1.default.findOne({ email }).select("+password");
        if (!user) {
            return next(new ErrorHandler_1.default("Invalid email or password", 401));
        }
        const isPasswordMatched = await user.comparePassword(password);
        if (!isPasswordMatched) {
            return next(new ErrorHandler_1.default("Invalid email or password", 401));
        }
        await (0, jwt_1.sendToken)(user, 200, res);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
// logout user
exports.logoutUser = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        // remove session from redis
        redis_1.default.del(req.user?._id);
        // clear cookies
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
// update refresh token
exports.updateRefreshToken = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const { refreshToken } = req.cookies;
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN);
        if (!decoded) {
            return next(new ErrorHandler_1.default("Could not refresh token", 400));
        }
        const session = await redis_1.default.get(decoded.id);
        if (!session) {
            return next(new ErrorHandler_1.default("Could not refresh token", 400));
        }
        const user = JSON.parse(session);
        const accessToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.ACCESS_TOKEN, {
            expiresIn: "5m",
        });
        const newRefreshToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.REFRESH_TOKEN, {
            expiresIn: "7d",
        });
        req.user = user;
        res.cookie("accessToken", accessToken, jwt_1.accessTokenOptions);
        res.cookie("refreshToken", newRefreshToken, jwt_1.refreshTokenOptions);
        await redis_1.default.set(user._id, JSON.stringify(user), "EX", 7 * 24 * 60 * 60);
        res.status(200).json({
            success: true,
            accessToken,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
// social login
exports.socialLogin = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const { name, email, avatar } = req.body;
        const user = await user_model_1.default.findOne({ email });
        if (!user) {
            if (avatar) {
                const result = await cloudinary_1.default.v2.uploader.upload(avatar, {
                    folder: "avatars",
                    width: 150,
                });
                const newUser = await user_model_1.default.create({
                    name,
                    email,
                    avatar: {
                        public_id: result.public_id,
                        url: result.secure_url,
                    },
                });
                await (0, jwt_1.sendToken)(newUser, 200, res);
            }
            const newUser = await user_model_1.default.create({
                name,
                email,
                avatar,
            });
            await (0, jwt_1.sendToken)(newUser, 200, res);
        }
        else {
            await (0, jwt_1.sendToken)(user, 200, res);
        }
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
