import { Router } from "express";
import Student from "../models/Student";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/", async (req, res) => {
  res.json(await Student.find().populate("user").populate("institution"));
});

router.post("/", authMiddleware, async (req, res) => {
  res.json(await Student.create(req.body));
});

router.get("/:id", async (req, res) => {
  res.json(await Student.findById(req.params.id));
});

router.put("/:id", authMiddleware, async (req, res) => {
  res.json(
    await Student.findByIdAndUpdate(req.params.id, req.body, { new: true })
  );
});

router.delete("/:id", authMiddleware, async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

export default router;
