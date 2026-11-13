// productRoutes.ts server/src/routes/productRoutes.ts
// Which URL runs which function for products. routes/index.ts puts these under /api/products.

// STEP 16 (part 2): The products API routes

import { Router } from "express";
import { getProduct, getProducts } from "../controllers/productController";

const router = Router();

router.get("/", getProducts); // GET /api/products?category=...&search=...&sort=...&page=...
router.get("/:idOrSlug", getProduct); // GET /api/products/smart-watch-ultra

export default router;
