"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const db_1 = __importDefault(require("./config/db"));
require("dotenv").config();
// create server
let PORT = process.env.PORT || 8000;
app_1.app.listen(PORT, () => {
    console.log(`Server running on port:${PORT}`);
    (0, db_1.default)();
});
