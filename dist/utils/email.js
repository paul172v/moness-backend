"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mail_1 = __importDefault(require("@sendgrid/mail"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: "./config.env" });
// Choose email provider dynamically
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || "mailtrap"; // Default to Mailtrap for testing
const sendEmail = (_a) => __awaiter(void 0, [_a], void 0, function* ({ email, subject, html, attachments, }) {
    if (EMAIL_PROVIDER === "sendgrid") {
        // ✅ SendGrid Configuration
        mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
            to: email,
            from: "paul@paul172v-portfolio.co.uk", // Verified sender for SendGrid
            subject: subject,
            html: html,
            attachments: attachments
                ? attachments.map((att) => ({
                    filename: att.filename,
                    content: fs_1.default.readFileSync(att.path).toString("base64"), // ✅ Read file content as base64
                    cid: att.cid,
                }))
                : [],
        };
        try {
            yield mail_1.default.send(msg);
            console.log("✅ Email sent via SendGrid");
        }
        catch (error) {
            console.error("❌ SendGrid Error:", error.message);
            if (error.response) {
                console.error("❌ SendGrid Response:", error.response.body);
            }
        }
    }
    else {
        // ✅ Mailtrap Configuration
        const transporter = nodemailer_1.default.createTransport({
            host: process.env.MAILTRAP_HOST,
            port: Number(process.env.MAILTRAP_PORT) || 2525,
            auth: {
                user: process.env.MAILTRAP_USER,
                pass: process.env.MAILTRAP_PASS,
            },
        });
        const mailOptions = {
            from: `"Moness Staff Portal" <paul@paul172v-portfolio.co.uk>`,
            to: email,
            subject,
            html,
            attachments: attachments
                ? attachments.map((att) => ({
                    filename: att.filename,
                    path: att.path,
                    cid: att.cid,
                }))
                : [],
        };
        try {
            yield transporter.sendMail(mailOptions);
            console.log("✅ Email sent via Mailtrap");
        }
        catch (error) {
            console.error("❌ Mailtrap Error:", error.message);
        }
    }
});
exports.default = sendEmail;
//// Sendgrid
// Sendgrid recovery code
// 6NSMVSJZZP1CED257RGTLAZX
// Username: moness-staff-portal
