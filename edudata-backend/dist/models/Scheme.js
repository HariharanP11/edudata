"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const SchemeSchema = new mongoose_1.default.Schema({
    title: { type: String, required: true },
    description: String,
    eligibility: String
}, { timestamps: true });
exports.default = mongoose_1.default.model("Scheme", SchemeSchema);
