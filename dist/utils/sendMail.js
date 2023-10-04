"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ejs_1 = __importDefault(require("ejs"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const path_1 = __importDefault(require("path"));
const sendMail = async ({ email, subject, template, data, }) => {
    const transporter = nodemailer_1.default.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        service: process.env.SMTP_SERVICE,
        auth: {
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });
    console.log("__dirname: ", path_1.default.join(__dirname, "../views", template));
    console.log("data: ", data);
    console.log('email: ', email);
    const mailOptions = {
        from: process.env.SMTP_EMAIL,
        to: email,
        subject,
        html: await ejs_1.default.renderFile(path_1.default.join(__dirname, "../views", template), data),
    };
    await transporter
        .sendMail(mailOptions)
        .then((info) => {
        console.log("Message sent: %s", info.messageId);
    })
        .catch((error) => {
        console.log("Error: ", error);
    });
};
exports.default = sendMail;
