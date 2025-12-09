"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmailOtp = sendEmailOtp;
const nodemailer_1 = __importDefault(require("nodemailer"));
const gmailUser = process.env.GMAIL_USER || "";
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD || "";
const fromEmail = process.env.OTP_FROM_EMAIL || gmailUser;
let transporter = null;
if (gmailUser && gmailAppPassword) {
    transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: gmailUser,
            pass: gmailAppPassword,
        },
    });
}
else {
    console.warn("[OTP-Email] GMAIL_USER/GMAIL_APP_PASSWORD not configured. OTP emails will not be sent.");
}
/**
 * Send OTP code via Gmail.
 * Returns true on success, false on failure or when mailer not configured.
 */
async function sendEmailOtp(to, code, expiryMinutes) {
    if (!transporter || !fromEmail) {
        return false;
    }
    try {
        await transporter.sendMail({
            from: fromEmail,
            to,
            subject: "Your EduData OTP Code",
            text: `Your EduData OTP is: ${code}. It expires in ${expiryMinutes} minutes.`,
        });
        return true;
    }
    catch (err) {
        console.warn("[OTP-Email] send failed:", err);
        return false;
    }
}
