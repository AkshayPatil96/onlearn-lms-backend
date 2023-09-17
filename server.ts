import { v2 as cloudinary } from "cloudinary";
import { app } from "./app";
import connectDB from "./config/db";

require("dotenv").config();

// cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY as string,
  api_secret: process.env.CLOUD_SECRET_KEY as string,
});

// create server
let PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port:${PORT}`);
  connectDB();
});
