"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    const uri = process.env.MONGO_URI;
    if (!uri)
        throw new Error("MONGO_URI missing");
    try {
        await mongoose_1.default.connect(uri);
        console.log("MongoDB Connected ✔");
    }
    catch (err) {
        console.error("MongoDB Error ❌", err);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
