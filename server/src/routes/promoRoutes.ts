// promoRoutes.ts server/src/routes/promoRoutes.ts
// routes/index.ts puts these under /api/promo-codes.

// STEP 21 (part 5): Promo code routes

import { Router } from "express";
import { checkPromoCode } from "../controllers/promoController";

const router = Router();

// No protect: shoppers who aren't logged in can try a code in their cart too
router.post("/check", checkPromoCode);

export default router;
