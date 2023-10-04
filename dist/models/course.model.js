"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const reviewSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        default: 0,
    },
    comment: {
        type: String,
        required: true,
    },
    commentReplies: [Object],
}, { timestamps: true });
const linkSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
}, { timestamps: true });
const commentSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    question: {
        type: String,
        required: true,
    },
    questionReplies: [Object],
}, { timestamps: true });
const courseDataSchema = new mongoose_1.Schema({
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    videoUrl: {
        type: String,
    },
    videoSection: {
        type: String,
    },
    videoLength: {
        type: Number,
    },
    videoPlayer: {
        type: String,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    links: [linkSchema],
    suggestion: {
        type: String,
    },
    questions: [commentSchema],
}, { timestamps: true });
const courseSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "Please enter course name"],
        trim: true,
        maxLength: [100, "Course name cannot exceed 100 characters"],
    },
    description: {
        type: String,
        required: [true, "Please enter course description"],
    },
    courseData: [courseDataSchema],
    price: {
        type: Number,
        required: [true, "Please enter course price"],
        maxLength: [5, "Course price cannot exceed 5 characters"],
        default: 0.0,
    },
    estimatedPrice: {
        type: Number,
        maxLength: [5, "Course price cannot exceed 5 characters"],
    },
    thumbnail: {
        public_id: {
            type: String,
        },
        url: {
            type: String,
        },
    },
    tags: {
        type: [String],
        required: [true, "Please enter course tags"],
    },
    level: {
        type: String,
        required: [true, "Please enter course level"],
        enum: {
            values: ["Beginner", "Intermediate", "Advanced"],
            message: "Please select correct course level",
        },
    },
    demoUrl: {
        type: String,
        required: [true, "Please enter course demo url"],
    },
    benefits: [
        {
            title: {
                type: String,
                required: true,
            },
        },
    ],
    prerequisites: [
        {
            title: {
                type: String,
                required: true,
            },
        },
    ],
    reviews: [reviewSchema],
    ratings: {
        type: Number,
        default: 0,
    },
    puchased: {
        type: Number,
        default: 0,
    },
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    editAccess: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
const CourseModel = mongoose_1.default.model("Course", courseSchema);
exports.default = CourseModel;
