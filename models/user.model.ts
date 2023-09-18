import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose, { Document, Model, Schema } from "mongoose";

const emailRegex: RegExp = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar: {
    public_id: string;
    url: string;
  };
  role: string;
  isVerified: boolean;
  courses: Array<{ courseId: string }>;
  isDeleted: boolean;
  comparePassword: (enteredPassword: string) => Promise<boolean>;
  signAccessToken: () => string;
  signRefreshToken: () => string;
}

const userSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
      maxLength: [30, "Your name cannot exceed 30 characters"],
    },

    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      validate: {
        validator: function (v: string) {
          return emailRegex.test(v);
        },
        message: (props: any) => `Please enter a valid email`,
      },
    },
    password: {
      type: String,
      minLength: [6, "Your password must be longer than 6 characters"],
      select: false,
    },

    avatar: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    role: {
      type: String,
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    courses: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
        },
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// hash password before saving user
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// sign jwt access token
userSchema.methods.signAccessToken = function (): string {
  return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN || "", {
    expiresIn: "5m",
  });
};

// sign jwt refresh token
userSchema.methods.signRefreshToken = function (): string {
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN || "", {
    expiresIn: "7d",
  });
};

// compare user password
userSchema.methods.comparePassword = async function (
  enteredPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

const UserModel: Model<IUser> = mongoose.model("User", userSchema);

export default UserModel;
