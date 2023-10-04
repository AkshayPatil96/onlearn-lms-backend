"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLayoutByType = exports.editLayout = exports.createLayout = void 0;
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const layout_model_1 = __importDefault(require("../models/layout.model"));
const cloudinary_1 = __importDefault(require("cloudinary"));
// create layout - POST /api/v1/layout (POST) - PRIVATE - ADMIN ONLY
exports.createLayout = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const { type } = req.body;
        // if type exists
        const typeExist = await layout_model_1.default.findOne({ type });
        if (typeExist) {
            return next(new ErrorHandler_1.default(`Layout for ${type} already exists`, 400));
        }
        if (type === "Banner") {
            const { image, title, subTitle } = req.body;
            const myCloud = await cloudinary_1.default.v2.uploader.upload(image, {
                folder: "layout",
            });
            await layout_model_1.default.create({
                type,
                banner: {
                    images: {
                        public_id: myCloud.public_id,
                        url: myCloud.secure_url,
                    },
                    title,
                    subTitle,
                },
            });
        }
        if (type === "FAQ") {
            // gets faq array
            const { faq } = req.body;
            const faqItems = await Promise.all(faq.map(async (item) => {
                const { question, answer } = item;
                const faqItem = {
                    question,
                    answer,
                };
                return faqItem;
            }));
            await layout_model_1.default.create({ type: "FAQ", faq: faqItems });
        }
        if (type === "Categories") {
            // gets categories array
            const { categories } = req.body;
            const categoriesItem = await Promise.all(categories.map(async (item) => {
                const { title } = item;
                return {
                    title,
                };
            }));
            await layout_model_1.default.create({
                type: "Categories",
                categories: categoriesItem,
            });
        }
        res.status(201).json({
            success: true,
            message: "Layout created successfully",
        });
    }
    catch (error) {
        next(new ErrorHandler_1.default(error.statusCode, error.message));
    }
});
// edit layout - PUT /api/v1/layout/ (PUT) - PRIVATE - ADMIN ONLY
exports.editLayout = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const { type } = req.body;
        if (type === "Banner") {
            const { image, title, subTitle } = req.body;
            const bannerData = await layout_model_1.default.findOne({ type: "Banner" });
            if (bannerData?.banner?.images?.length) {
                await cloudinary_1.default.v2.uploader.destroy(bannerData?.banner?.images?.[0]?.public_id);
            }
            const myCloud = await cloudinary_1.default.v2.uploader.upload(image, {
                folder: "layout",
            });
            const banner = {
                images: {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
                },
                title,
                subTitle,
                type: "Banner",
            };
            await layout_model_1.default.findOneAndUpdate({ type: "Banner" }, banner, {
                new: true,
            });
        }
        if (type === "FAQ") {
            // gets faq array
            const { faq } = req.body;
            const faqItm = await layout_model_1.default.findOne({ type: "FAQ" });
            const faqItems = await Promise.all(faq.map(async (item) => {
                const { question, answer } = item;
                const faqItem = {
                    question,
                    answer,
                };
                return faqItem;
            }));
            await layout_model_1.default.findByIdAndUpdate(faqItm?._id, {
                type: "FAQ",
                faq: faqItems,
            }, {
                new: true,
            });
        }
        if (type === "Categories") {
            // gets categories array
            const { categories } = req.body;
            const category = await layout_model_1.default.findOne({ type: "Categories" });
            const categoriesItem = await Promise.all(categories.map(async (item) => {
                const { title } = item;
                return {
                    title,
                };
            }));
            await layout_model_1.default.findByIdAndUpdate(category?._id, {
                type: "Categories",
                categories: categoriesItem,
            }, {
                new: true,
            });
        }
        res.status(200).json({
            success: true,
            message: "Layout updated successfully",
        });
    }
    catch (error) {
        next(new ErrorHandler_1.default(error.statusCode, error.message));
    }
});
// get layout by type - GET /api/v1/layout/:type (GET) - PUBLIC
exports.getLayoutByType = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const { type } = req.params;
        const layout = await layout_model_1.default.findOne({ type: new RegExp(type, "i") });
        res.status(200).json({
            success: true,
            layout,
        });
    }
    catch (error) {
        next(new ErrorHandler_1.default(error.statusCode, error.message));
    }
});
