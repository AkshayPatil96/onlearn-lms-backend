"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveTemperoryDeletedUser = exports.deleteUserTemperory = exports.updateUserAvatar = exports.updateUserPassword = exports.updateUserInfo = exports.getUserInfo = void 0;
const cloudinary_1 = __importDefault(require("cloudinary"));
const redis_1 = __importDefault(require("../config/redis"));
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const user_model_1 = __importDefault(require("../models/user.model"));
const user_service_1 = require("../services/user.service");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const node_cron_1 = __importDefault(require("node-cron"));
// get user info
exports.getUserInfo = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const userId = req.user?._id;
        (0, user_service_1.getUserById)(userId, res);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
exports.updateUserInfo = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const { name, email } = req.body;
        const userId = req.user?._id;
        const user = await user_model_1.default.findById(userId);
        if (user && email) {
            const emailExist = await user_model_1.default.findOne({ email });
            if (emailExist) {
                return next(new ErrorHandler_1.default("Email already exist", 400));
            }
            user.email = email;
        }
        if (user && name) {
            user.name = name;
        }
        await user?.save();
        await redis_1.default.set(user?._id, JSON.stringify(user));
        res.status(200).json({
            success: true,
            message: "User updated successfully",
            user,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
exports.updateUserPassword = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return next(new ErrorHandler_1.default("Please provide old and new password", 400));
        }
        const user = await user_model_1.default.findById(req.user?._id).select("+password");
        if (user) {
            if (user?.password === undefined) {
                return next(new ErrorHandler_1.default("Invalid user", 404));
            }
            const isMatch = await user.comparePassword(oldPassword);
            if (!isMatch) {
                return next(new ErrorHandler_1.default("Old password is invalid", 400));
            }
            user.password = newPassword;
            await user.save();
            await redis_1.default.set(user?._id, JSON.stringify(user));
            res.status(200).json({
                success: true,
                message: "Password updated successfully",
            });
        }
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
exports.updateUserAvatar = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const { avatar } = req.body;
        const user = await user_model_1.default.findById(req.user?._id);
        if (avatar) {
            if (user) {
                if (user?.avatar?.public_id) {
                    await cloudinary_1.default.v2.uploader.destroy(user.avatar.public_id);
                }
                let image = await cloudinary_1.default.v2.uploader.upload(avatar, {
                    folder: "avatar",
                    width: 150,
                });
                console.log("image: ", image);
                user.avatar = {
                    public_id: image.public_id,
                    url: image.secure_url,
                };
                await user.save();
                await redis_1.default.set(user?._id, JSON.stringify(user));
            }
        }
        else {
            return next(new ErrorHandler_1.default("Please provide an image", 400));
        }
        res.status(200).json({
            success: true,
            message: "Avatar updated successfully",
            user,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
// delete user temperory => /api/v1/user/delete-temperory (DELETE) (user)
exports.deleteUserTemperory = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        (0, user_service_1.deleteUserTemperorySevice)(req.user?._id, res);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
// cron job to delete user after 14 days of temperory deletion
node_cron_1.default.schedule("0 0 */14 * *", async () => {
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    await user_model_1.default.deleteMany({
        updatedAt: { $lte: fourteenDaysAgo },
        isDeleted: true,
    });
    console.log("Deleted users");
    await redis_1.default.flushall();
    console.log("Flushed redis");
});
// retrieve temperory deleted user => /api/v1/users/retrieve (GET) (user)
exports.retrieveTemperoryDeletedUser = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        (0, user_service_1.retrieveUserService)(req.user?._id, res);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
