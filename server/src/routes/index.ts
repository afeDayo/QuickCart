// routes/index.ts
// Joins all the route files together app.ts puts these under /api

import { Router } from "express";

// STEP 5: Join the routes and add a health check
// One router joins all the route files. app.ts mounts it at /api, so a route like e.g "/products" becomes /api/products

const router = Router();

// GET /api/health: a quick check that the API is running
router.get("/health", (_req, res) => {
  res.json({ status: "ok", message: "QuickCart API is running" });
});

export default router;

// Next: STEP 6 (start the server) -> server/src/server.ts
