"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const db_1 = require("../config/db");
const User_1 = __importDefault(require("../models/User"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function seed() {
    await (0, db_1.connectDB)();
    console.log("Seeding data...");
    const adminLoginId = "admin";
    const adminEmail = "admin@edudata.local";
    const adminPassword = "admin123";
    let admin = await User_1.default.findOne({
        $or: [{ email: adminEmail }, { loginId: adminLoginId }],
    });
    if (!admin) {
        admin = await User_1.default.create({
            name: "Admin",
            email: adminEmail,
            loginId: adminLoginId,
            password: await bcryptjs_1.default.hash(adminPassword, 10),
            role: "admin",
        });
    }
    console.log("Admin user seeded:", { loginId: adminLoginId, email: adminEmail });
    process.exit(0);
}
seed();
