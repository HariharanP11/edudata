"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function authMiddleware(req, res, next) {
    const auth = (req.headers.authorization || req.headers.Authorization);
    if (!auth || !auth.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token" });
    }
    const token = auth.split(" ")[1];
    const secret = process.env.JWT_SECRET || "changeme";
    try {
        const payload = jsonwebtoken_1.default.verify(token, secret);
        // attach payload to req.user so controllers can use it
        req.user = payload;
        return next();
    }
    catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
}
