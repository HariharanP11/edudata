"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("../config/db");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const institutions_routes_1 = __importDefault(require("./institutions.routes"));
const students_routes_1 = __importDefault(require("./students.routes"));
const teachers_routes_1 = __importDefault(require("./teachers.routes"));
const schemes_routes_1 = __importDefault(require("./schemes.routes"));
const startServer = async () => {
    const app = (0, express_1.default)();
    const PORT = process.env.PORT || 5000;
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    // routes
    app.use("/api/auth", auth_routes_1.default);
    app.use("/api/institutions", institutions_routes_1.default);
    app.use("/api/students", students_routes_1.default);
    app.use("/api/teachers", teachers_routes_1.default);
    app.use("/api/schemes", schemes_routes_1.default);
    await (0, db_1.connectDB)();
    app.listen(PORT, () => console.log("Server running on http://localhost:" + PORT));
};
exports.startServer = startServer;
