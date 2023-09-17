import mongoose from "mongoose";
require("dotenv").config();

const dbURI: string = process.env.DB_URI || "";

const connectDB = async () => {
  try {
    await mongoose
      .connect(dbURI)
      .then((res) =>
        console.log(`MongoDB connected with ${res.connection.host}`),
      );
  } catch (error: any) {
    console.log(error.message);
    setTimeout(connectDB, 5000);
  }
};

export default connectDB;
