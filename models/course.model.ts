import mongoose, { Document, Model, Schema } from "mongoose";
import { IUser } from "./user.model";

interface IComment extends Document {
  user: IUser;
  question: string;
  questionReplies?: IComment[];
}

interface ILink extends Document {
  title: string;
  url: string;
}

interface IReview extends Document {
  user: IUser;
  rating?: number;
  comment: string;
  commentReplies?: IReview[];
}

interface ICourseData extends Document {
  title: string;
  description: string;
  videoUrl: string;
  videoSection: string;
  videoLength: number;
  videoPlayer: string;
  links: ILink[];
  suggestion: string;
  questions: IComment[];
}

export interface ICourse extends Document {
  name: string;
  description: string;
  courseData: ICourseData[];
  price: number;
  estimatedPrice?: number;
  thumbnail: object;
  tags: string[];
  level: string;
  demoUrl: string;
  benefits: { title: string }[];
  prerequisites: { title: string }[];
  reviews: IReview[];
  ratings: number;
  puchased?: number;
}

const reviewSchema = new Schema<IReview>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
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
  },
  { timestamps: true },
);

const linkSchema = new Schema<ILink>(
  {
    title: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const commentSchema = new Schema<IComment>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    questionReplies: [Object],
  },
  { timestamps: true },
);

const courseDataSchema = new Schema<ICourseData>(
  {
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
    links: [linkSchema],
    suggestion: {
      type: String,
    },
    questions: [commentSchema],
  },
  { timestamps: true },
);

const courseSchema = new Schema<ICourse>(
  {
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
  },
  { timestamps: true },
);

const CourseModel: Model<ICourse> = mongoose.model("Course", courseSchema);

export default CourseModel;
