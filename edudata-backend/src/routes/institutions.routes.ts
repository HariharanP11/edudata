import { Router } from "express";
import Institution from "../models/Institution";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/", async (req, res) => {
  res.json(await Institution.find());
});

router.post("/", authMiddleware, async (req, res) => {
  res.json(await Institution.create(req.body));
});

router.get("/:id", async (req, res) => {
  res.json(await Institution.findById(req.params.id));
});

router.put("/:id", authMiddleware, async (req, res) => {
  res.json(
    await Institution.findByIdAndUpdate(req.params.id, req.body, { new: true })
  );
});

router.delete("/:id", authMiddleware, async (req, res) => {
  await Institution.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

export default router;
