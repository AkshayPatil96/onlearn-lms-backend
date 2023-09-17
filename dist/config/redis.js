"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = require("ioredis");
require("dotenv").config();
const redisClient = () => {
    if (process.env.REDIS_URL) {
        console.log("Redis connected");
        return process.env.REDIS_URL;
    }
    throw new Error("Redis connection failed");
};
const redis = new ioredis_1.Redis(redisClient());
exports.default = redis;
