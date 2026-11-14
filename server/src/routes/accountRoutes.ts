// accountRoutes.ts server/src/routes/accountRoutes.ts
// My Account routes. routes/index.ts puts these under /api/account.

// STEP 20: My Account routes

import { Router } from "express";
import {
  addAddress,
  changePassword,
  deleteAddress,
  getAddresses,
  getSavedItems,
  saveItem,
  unsaveItem,
  updateAddress,
  updateProfile,
} from "../controllers/accountController";
import { protect } from "../middleware/auth";

const router = Router();

// router.use(protect) puts protect in front of EVERY route below it, so we don't repeat it 9 times
router.use(protect);

router.patch("/profile", updateProfile);
router.patch("/password", changePassword);

router.get("/addresses", getAddresses);
router.post("/addresses", addAddress);
router.patch("/addresses/:addressId", updateAddress);
router.delete("/addresses/:addressId", deleteAddress);

router.get("/saved", getSavedItems);
router.post("/saved/:productId", saveItem);
router.delete("/saved/:productId", unsaveItem);

export default router;
