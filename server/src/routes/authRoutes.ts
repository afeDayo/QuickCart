// authRoutes.ts server/src/routes/authRoutes.ts
// Which URL runs which auth function. routes/index.ts puts these under /api/auth.

// STEP 18 (part 4): The auth routes

import { Router } from "express";
import {
  checkEmail,
  getMe,
  login,
  logout,
  register,
} from "../controllers/authController";
import { protect } from "../middleware/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/check-email", checkEmail);
router.get("/me", protect, getMe); // protect runs first; getMe only runs if it calls next()
router.post("/logout", protect, logout);

export default router;
