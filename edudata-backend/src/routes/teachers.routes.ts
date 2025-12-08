import { Router } from "express";
import Teacher from "../models/Teacher";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/", async (req, res) => {
  res.json(await Teacher.find().populate("user").populate("institution"));
});

router.post("/", authMiddleware, async (req, res) => {
  res.json(await Teacher.create(req.body));
});

router.get("/:id", async (req, res) => {
  res.json(await Teacher.findById(req.params.id));
});

router.put("/:id", authMiddleware, async (req, res) => {
  res.json(
    await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true })
  );
});

router.delete("/:id", authMiddleware, async (req, res) => {
  await Teacher.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

export default router;
