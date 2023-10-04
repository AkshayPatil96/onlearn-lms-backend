"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllOrdersService = exports.newOrder = void 0;
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const order_model_1 = __importDefault(require("../models/order.model"));
// create new order
exports.newOrder = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (data, next) => {
    const order = await order_model_1.default.create(data);
    return order;
});
// get all orders
const getAllOrdersService = async (res) => {
    const orders = await order_model_1.default.find({}).sort({
        createdAt: -1,
    });
    res.status(200).json({
        success: true,
        orders,
    });
};
exports.getAllOrdersService = getAllOrdersService;
