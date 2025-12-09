"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = signup;
exports.login = login;
exports.verifyOtp = verifyOtp;
exports.resendOtp = resendOtp;
exports.resendOtpEmail = resendOtpEmail;
exports.me = me;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const User_1 = __importDefault(require("../models/User"));
const Otp_1 = __importDefault(require("../models/Otp"));
const twilio_1 = __importDefault(require("twilio"));
const emailOtp_1 = require("../utils/emailOtp");
const JWT_SECRET = process.env.JWT_SECRET || "changeme";
// OTP config from env (defaults)
// NOTE: We enable OTP by default. Set ENABLE_OTP="false" in .env to fall back to single-step login.
const ENABLE_OTP = process.env.ENABLE_OTP !== "false";
const OTP_LENGTH = Number(process.env.OTP_LENGTH || 6);
const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES || 5);
const OTP_RATE_LIMIT_COUNT = Number(process.env.OTP_RATE_LIMIT_COUNT || 3);
const OTP_RATE_LIMIT_WINDOW_MINUTES = Number(process.env.OTP_RATE_LIMIT_WINDOW_MINUTES || 10);
// Twilio config (optional)
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || "";
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || "";
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER || "";
let twilioClient = null;
if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
    try {
        twilioClient = (0, twilio_1.default)(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    }
    catch (err) {
        console.warn("Twilio init failed:", err);
        twilioClient = null;
    }
}
/** Helper: send OTP to contact (phone/email). Falls back to console.log */
async function sendOtpToContact(contact, code) {
    // 1) Try SMS via Twilio when contact looks like a phone number
    if (twilioClient && contact && contact.startsWith("+")) {
        // phone format expected like +91xxxxxxxxxx
        try {
            await twilioClient.messages.create({
                body: `Your EduData OTP is: ${code}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
                from: TWILIO_FROM_NUMBER,
                to: contact,
            });
            return { via: "sms" };
        }
        catch (err) {
            console.warn("Twilio send failed:", err);
            // fallthrough to email/console fallback
        }
    }
    // 2) Try email via Gmail when contact looks like an email address
    if (contact && contact.includes("@")) {
        const ok = await (0, emailOtp_1.sendEmailOtp)(contact, code, OTP_EXPIRY_MINUTES);
        if (ok) {
            return { via: "email" };
        }
    }
    // 3) Fallback (development): print OTP to server console
    console.log(`[OTP] contact=${contact} code=${code}`);
    return { via: "console" };
}
// ------------------- signup (unchanged, but supports loginId & phone) -------------------
async function signup(req, res) {
    try {
        const { name, email, password, role, loginId, phone } = req.body;
        const existing = await User_1.default.findOne({
            $or: [{ email }, { loginId }],
        });
        if (existing)
            return res.status(400).json({ message: "User exists" });
        const hash = await bcryptjs_1.default.hash(password, 10);
        const user = await User_1.default.create({
            name,
            email,
            loginId,
            password: hash,
            role,
            phone,
        });
        const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
        // hide password in response
        const safe = user.toObject();
        delete safe.password;
        res.json({ user: safe, token });
    }
    catch (err) {
        console.error("signup error:", err);
        res.status(500).json({ error: String(err) });
    }
}
// ------------------- login (password check -> create OTP session) -------------------
async function login(req, res) {
    try {
        // Accept either { email, password } or { loginId, password }
        const { email, password, loginId } = req.body;
        if (!password)
            return res.status(400).json({ message: "Missing password" });
        // Lookup by email or loginId
        const query = {};
        if (email)
            query.email = email;
        else if (loginId)
            query.loginId = loginId;
        else
            return res.status(400).json({ message: "Provide email or loginId" });
        const user = await User_1.default.findOne(query);
        if (!user)
            return res.status(400).json({ message: "Invalid credentials" });
        // password is already hashed in DB
        const match = await bcryptjs_1.default.compare(password, user.password);
        if (!match)
            return res.status(400).json({ message: "Invalid credentials" });
        // If OTP disabled, issue JWT immediately
        if (!ENABLE_OTP) {
            const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
            const safe = user.toObject();
            delete safe.password;
            return res.json({ user: safe, token });
        }
        // Rate-limiting: count OTP requests for this contact in window
        const contact = user.phone || user.email; // prefer phone; fallback to email (development)
        const windowAgo = new Date(Date.now() - OTP_RATE_LIMIT_WINDOW_MINUTES * 60000);
        const recentCount = await Otp_1.default.countDocuments({
            contact,
            createdAt: { $gte: windowAgo },
        });
        if (recentCount >= OTP_RATE_LIMIT_COUNT) {
            return res.status(429).json({
                message: `Too many OTP attempts. Try again after ${OTP_RATE_LIMIT_WINDOW_MINUTES} minutes.`,
            });
        }
        // Create OTP code and token
        const code = String(Math.floor(Math.random() * 10 ** OTP_LENGTH)).padStart(OTP_LENGTH, "0");
        const sessionToken = crypto_1.default.randomBytes(16).toString("hex");
        const hashedCode = await bcryptjs_1.default.hash(code, 10);
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60000);
        // Save OTP document
        await Otp_1.default.create({
            token: sessionToken,
            userId: user._id,
            contact,
            code: hashedCode,
            expiresAt,
            used: false,
        });
        // Send SMS via Twilio if configured, otherwise console.log fallback
        await sendOtpToContact(contact, code);
        // Tell frontend OTP required and return the session token (not JWT)
        res.json({
            otpRequired: true,
            sessionToken,
            message: "OTP sent to registered contact (phone/email).",
        });
    }
    catch (err) {
        console.error("login error:", err);
        res.status(500).json({ error: String(err) });
    }
}
// ------------------- verifyOtp (exchange OTP session token + code => final JWT) -------------------
async function verifyOtp(req, res) {
    try {
        const { sessionToken, code } = req.body;
        if (!sessionToken || !code) {
            return res.status(400).json({ message: "sessionToken and code required" });
        }
        const otpDoc = await Otp_1.default.findOne({ token: sessionToken });
        if (!otpDoc)
            return res.status(400).json({ message: "Invalid or expired OTP session" });
        if (otpDoc.used)
            return res.status(400).json({ message: "OTP already used" });
        if (otpDoc.expiresAt < new Date())
            return res.status(400).json({ message: "OTP expired" });
        // compare hashed OTP
        const ok = await bcryptjs_1.default.compare(String(code), otpDoc.code);
        if (!ok) {
            return res.status(400).json({ message: "Invalid OTP code" });
        }
        // Mark used
        otpDoc.used = true;
        await otpDoc.save();
        // Issue JWT now
        const user = await User_1.default.findById(otpDoc.userId);
        if (!user)
            return res.status(400).json({ message: "User not found" });
        const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, {
            expiresIn: "7d",
        });
        // return user (without password) and token
        const safeUser = user.toObject();
        delete safeUser.password;
        res.json({ user: safeUser, token });
    }
    catch (err) {
        console.error("verifyOtp error:", err);
        res.status(500).json({ error: String(err) });
    }
}
// ------------------- resend OTP (creates a fresh OTP and returns sessionToken) -------------------
async function resendOtp(req, res) {
    try {
        const { sessionToken } = req.body;
        if (!sessionToken)
            return res.status(400).json({ message: "sessionToken required" });
        // Find existing otp session to get user/contact
        const old = await Otp_1.default.findOne({ token: sessionToken });
        if (!old)
            return res.status(400).json({ message: "Invalid sessionToken" });
        if (old.used)
            return res.status(400).json({ message: "OTP already used" });
        // Rate-limit check by contact
        const windowAgo = new Date(Date.now() - OTP_RATE_LIMIT_WINDOW_MINUTES * 60000);
        const recentCount = await Otp_1.default.countDocuments({
            contact: old.contact,
            createdAt: { $gte: windowAgo },
        });
        if (recentCount >= OTP_RATE_LIMIT_COUNT) {
            return res.status(429).json({
                message: `Too many OTP attempts. Try again after ${OTP_RATE_LIMIT_WINDOW_MINUTES} minutes.`,
            });
        }
        // Create new OTP
        const code = String(Math.floor(Math.random() * 10 ** OTP_LENGTH)).padStart(OTP_LENGTH, "0");
        const newToken = crypto_1.default.randomBytes(16).toString("hex");
        const hashed = await bcryptjs_1.default.hash(code, 10);
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60000);
        await Otp_1.default.create({
            token: newToken,
            userId: old.userId,
            contact: old.contact,
            code: hashed,
            expiresAt,
            used: false,
        });
        await sendOtpToContact(old.contact, code);
        res.json({ sessionToken: newToken, message: "OTP resent" });
    }
    catch (err) {
        console.error("resendOtp error:", err);
        res.status(500).json({ error: String(err) });
    }
}
// ------------------- resend OTP to email explicitly (uses user's registered email) -------------------
async function resendOtpEmail(req, res) {
    try {
        const { sessionToken } = req.body;
        if (!sessionToken)
            return res.status(400).json({ message: "sessionToken required" });
        const old = await Otp_1.default.findOne({ token: sessionToken });
        if (!old)
            return res.status(400).json({ message: "Invalid sessionToken" });
        if (old.used)
            return res.status(400).json({ message: "OTP already used" });
        // Look up user to get email
        const user = await User_1.default.findById(old.userId);
        if (!user || !user.email) {
            return res.status(400).json({ message: "User email not available for OTP" });
        }
        const emailContact = user.email;
        // Rate-limit check by email contact
        const windowAgo = new Date(Date.now() - OTP_RATE_LIMIT_WINDOW_MINUTES * 60000);
        const recentCount = await Otp_1.default.countDocuments({
            contact: emailContact,
            createdAt: { $gte: windowAgo },
        });
        if (recentCount >= OTP_RATE_LIMIT_COUNT) {
            return res.status(429).json({
                message: `Too many OTP attempts. Try again after ${OTP_RATE_LIMIT_WINDOW_MINUTES} minutes.`,
            });
        }
        // Create new OTP specifically for email
        const code = String(Math.floor(Math.random() * 10 ** OTP_LENGTH)).padStart(OTP_LENGTH, "0");
        const newToken = crypto_1.default.randomBytes(16).toString("hex");
        const hashed = await bcryptjs_1.default.hash(code, 10);
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60000);
        await Otp_1.default.create({
            token: newToken,
            userId: old.userId,
            contact: emailContact,
            code: hashed,
            expiresAt,
            used: false,
        });
        const sent = await (0, emailOtp_1.sendEmailOtp)(emailContact, code, OTP_EXPIRY_MINUTES);
        if (!sent) {
            return res.status(500).json({ message: "Failed to send OTP email" });
        }
        res.json({ sessionToken: newToken, message: "OTP sent to registered email" });
    }
    catch (err) {
        console.error("resendOtpEmail error:", err);
        res.status(500).json({ error: String(err) });
    }
}
// ------------------- me (unchanged) -------------------
async function me(req, res) {
    const id = req.user?.id;
    if (!id)
        return res.status(401).json({ message: "Unauthorized" });
    const user = await User_1.default.findById(id).select("-password");
    res.json(user);
}
