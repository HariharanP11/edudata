import { Router } from "express";
import Scheme from "../models/Scheme";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/", async (req, res) => {
  res.json(await Scheme.find());
});

router.post("/", authMiddleware, async (req, res) => {
  res.json(await Scheme.create(req.body));
});

router.get("/:id", async (req, res) => {
  res.json(await Scheme.findById(req.params.id));
});

router.put("/:id", authMiddleware, async (req, res) => {
  res.json(
    await Scheme.findByIdAndUpdate(req.params.id, req.body, { new: true })
  );
});

router.delete("/:id", authMiddleware, async (req, res) => {
  await Scheme.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

export default router;
