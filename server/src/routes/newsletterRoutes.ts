// newsletterRoutes.ts server/src/routes/newsletterRoutes.ts
// routes/index.ts puts these under /api/newsletter.

// STEP 24 (part 4): Newsletter routes

import { Router } from "express";
import { subscribe, unsubscribe } from "../controllers/newsletterController";

const router = Router();

// No login: anyone visiting the shop can subscribe from the footer
router.post("/subscribe", subscribe);
router.get("/unsubscribe/:token", unsubscribe); // a GET, because it's a link clicked in an email

export default router;
