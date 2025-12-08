// src/routes/auth.routes.ts
import { Router } from "express";
import * as authCtrl from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// public
router.post("/signup", authCtrl.signup);
router.post("/login", authCtrl.login);

// OTP endpoints
router.post("/verify-otp", authCtrl.verifyOtp);
router.post("/resend-otp", authCtrl.resendOtp);

// protected
router.get("/me", authMiddleware, authCtrl.me);

export default router;
