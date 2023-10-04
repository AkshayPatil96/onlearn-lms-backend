"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveUserService = exports.deleteUserPermanentlySevice = exports.deleteUserTemperorySevice = exports.updateUserRoleService = exports.getAllUsersService = exports.getUserById = void 0;
const redis_1 = __importDefault(require("../config/redis"));
const user_model_1 = __importDefault(require("../models/user.model"));
// get user by id
const getUserById = async (id, res) => {
    // const user = await UserModel.findById(id);
    const userJson = await redis_1.default.get(id);
    const user = JSON.parse(userJson);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }
    // if (user.isDeleted) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "User not found",
    //   });
    // }
    res.status(200).json({
        success: true,
        user,
    });
};
exports.getUserById = getUserById;
// get all users
const getAllUsersService = async (res) => {
    const users = await user_model_1.default.find({
        isDeleted: false,
    }).sort({
        createdAt: -1,
    });
    res.status(200).json({
        success: true,
        users,
    });
};
exports.getAllUsersService = getAllUsersService;
// update user role
const updateUserRoleService = async (id, role, res) => {
    const user = await user_model_1.default.findOneAndUpdate({
        _id: id,
        isDeleted: false,
    }, { role }, { new: true });
    await redis_1.default.set(user?._id, JSON.stringify(user), "EX", 7 * 24 * 60 * 60);
    res.status(200).json({
        success: true,
        user,
    });
};
exports.updateUserRoleService = updateUserRoleService;
// delete user temperory
const deleteUserTemperorySevice = async (id, res) => {
    const user = await user_model_1.default.findOne({
        _id: id,
        isDeleted: false,
    });
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }
    user.isDeleted = true;
    await user.save();
    await redis_1.default.set(user?._id, JSON.stringify(user), "EX", 7 * 24 * 60 * 60);
    res.status(200).json({
        success: true,
        message: "User deleted successfully",
    });
};
exports.deleteUserTemperorySevice = deleteUserTemperorySevice;
// delete user permanently
const deleteUserPermanentlySevice = async (id, res) => {
    const user = await user_model_1.default.findOne({
        _id: id,
        isDeleted: true,
    });
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }
    await user.deleteOne();
    await redis_1.default.del(user?._id);
    res.status(200).json({
        success: true,
        message: "User deleted permanently",
    });
};
exports.deleteUserPermanentlySevice = deleteUserPermanentlySevice;
// retrieve user
const retrieveUserService = async (id, res) => {
    const user = await user_model_1.default.findById(id);
    if (user && user.isDeleted) {
        user.isDeleted = false;
        await user.save();
        await redis_1.default.set(user?._id, JSON.stringify(user), "EX", 7 * 24 * 60 * 60);
        res.status(200).json({
            success: true,
            message: "User retrieved successfully",
            user,
        });
    }
};
exports.retrieveUserService = retrieveUserService;
