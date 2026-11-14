// authRoutes.ts server/src/routes/authRoutes.ts
// Which URL runs which auth function. routes/index.ts puts these under /api/auth.

// STEP 18 (part 4): The auth routes

import { Router } from "express";
import {
  checkEmail,
  checkResetToken,
  forgotPassword,
  getMe,
  login,
  logout,
  register,
  resetPassword,
  sendVerification,
  verifyEmail,
} from "../controllers/authController";
import { protect } from "../middleware/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/check-email", checkEmail);
router.get("/me", protect, getMe); // protect runs first; getMe only runs if it calls next()
router.post("/logout", protect, logout);
router.post("/forgot-password", forgotPassword);
router.get("/reset-password/:token", checkResetToken);
router.post("/reset-password/:token", resetPassword);
router.post("/send-verification", protect, sendVerification);
router.post("/verify-email", protect, verifyEmail);

export default router;
