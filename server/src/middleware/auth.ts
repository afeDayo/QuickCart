// auth.ts server/src/middleware/auth.ts
// Guards for routes:
//   router.get("/me", protect, getMe)                     -> must be logged in
//   router.post("/", protect, adminOnly, createProduct)   -> must be an admin

// STEP 18 (part 2): Route guards

import { NextFunction, Request, Response } from "express";
import { HydratedDocument } from "mongoose";
import { IUser, User } from "../models/User";
import { AppError } from "../utils/AppError";
import { verifyToken } from "../utils/token";

// Teach TypeScript that a request can carry the logged-in user: req.user
// (Express's Request type doesn't have "user", so we add it to Express's own type.)
declare global {
  namespace Express {
    interface Request {
      user?: HydratedDocument<IUser>; // a full user document, so later steps can change and .save() it
    }
  }
}

// protect: let the request through only if it carries a valid token for a user who still exists
export const protect = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  // 1. The header looks like "Bearer eyJhbGciOi..."
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw new AppError(401, "Please log in to continue.");
  }

  const token = header.split(" ")[1]; // the part after "Bearer "

  // 2. Check the token. A fake or expired one throws here -> errorHandler -> 401
  const payload = verifyToken(token);

  // 3. The user might have been deleted since the token was made
  const user = await User.findById(payload.id);
  if (!user) {
    throw new AppError(
      401,
      "This account no longer exists. Please log in again.",
    );
  }

  // 4. If the password was changed AFTER this token was made, the token is no longer accepted.
  //    (Someone who stole an old token is locked out as soon as the real owner changes the password.)
  //    Math.floor: iat is in whole seconds, so we compare whole seconds too. Without it, a token made in
  //    the same second as the change (e.g. right after "change password" in STEP 20) would be refused.
  if (user.passwordChangedAt) {
    const changedAt = Math.floor(user.passwordChangedAt.getTime() / 1000);
    if (changedAt > payload.iat) {
      throw new AppError(
        401,
        "Your password was changed. Please log in again.",
      );
    }
  }

  // 5. Remember who it is for the next function, and continue
  req.user = user;
  next();
};

// adminOnly: always put it AFTER protect (it needs req.user)
export const adminOnly = (req: Request, _res: Response, next: NextFunction) => {
  if (req.user?.role !== "admin") {
    throw new AppError(403, "Only admins can do this."); // 403 = "I know who you are, but no"
  }

  next();
};
