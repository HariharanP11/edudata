"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/User.ts
const mongoose_1 = __importDefault(require("mongoose"));
const UserSchema = new mongoose_1.default.Schema({
    loginId: { type: String, unique: true, sparse: true }, // sparse so it won't conflict when missing
    name: { type: String, required: true },
    role: {
        type: String,
        required: true,
        enum: ["student", "teacher", "institution", "government", "admin"],
        default: "student",
    },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: false },
    password: { type: String, required: true },
}, { timestamps: true });
// ensure indexes created
UserSchema.index({ email: 1 });
exports.default = mongoose_1.default.model("User", UserSchema);
