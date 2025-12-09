"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Student_1 = __importDefault(require("../models/Student"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get("/", async (req, res) => {
    res.json(await Student_1.default.find().populate("user").populate("institution"));
});
router.post("/", auth_middleware_1.authMiddleware, async (req, res) => {
    res.json(await Student_1.default.create(req.body));
});
router.get("/:id", async (req, res) => {
    res.json(await Student_1.default.findById(req.params.id));
});
router.put("/:id", auth_middleware_1.authMiddleware, async (req, res) => {
    res.json(await Student_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});
router.delete("/:id", auth_middleware_1.authMiddleware, async (req, res) => {
    await Student_1.default.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});
exports.default = router;
