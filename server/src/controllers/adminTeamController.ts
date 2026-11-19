// adminTeamController.ts server/src/controllers/adminTeamController.ts
// Admin → Settings → Team: who the admins are, making an existing account an admin, and taking admin rights away.
// GET    /api/admin/team          -> every admin
// POST   /api/admin/team          { "email": "tolu@gmail.com" }  -> that account becomes an admin
// DELETE /api/admin/team/:id      -> that admin becomes a normal customer again
// (adminRoutes.ts runs protect + adminOnly first, so only admins can use these.)

import { Request, Response } from "express";
import { env } from "../config/env";
import { User } from "../models/User";
import { AppError } from "../utils/AppError";
import { sendEmail } from "../utils/sendEmail";
import { OBJECT_ID } from "./productController";

// What the Team list shows (never passwords or secret codes)
const TEAM_FIELDS = "firstName lastName email createdAt";

// GET /api/admin/team
export const getTeam = async (_req: Request, res: Response) => {
  const admins = await User.find({ role: "admin" }).select(TEAM_FIELDS).sort({ createdAt: 1 }).lean();
  res.json({ admins });
};

// POST /api/admin/team   { email }
// Only an EXISTING account can be made an admin: the person signs up on the website first (their own password).
export const addAdmin = async (req: Request, res: Response) => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  if (!email) {
    throw new AppError(400, "Please enter the email of the person to make an admin.");
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new AppError(404, `No QuickCart account uses ${email}. Ask them to sign up on the website first.`);
  }
  if (user.role === "admin") {
    throw new AppError(409, `${user.firstName} ${user.lastName} is already an admin.`);
  }

  user.role = "admin";
  await user.save();

  // Tell them (the email never stops the change: sendEmail doesn't throw)
  void sendEmail(
    user.email,
    "You're now a QuickCart admin",
    `Hi ${user.firstName},\n\nYou've been made an admin of QuickCart. Sign in to the admin dashboard here:\n${env.clientUrl}/admin/login\n\nThe QuickCart team`,
  );

  // Admins sign in with a password. Someone who signed up with Google may not have one yet.
  const note = user.password ? "" : " They signed up with Google, so they must set a password first (Forgot password on the login page).";
  res.status(201).json({
    message: `${user.firstName} ${user.lastName} is now an admin.${note}`,
    admin: { _id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, createdAt: user.get("createdAt") },
  });
};

// DELETE /api/admin/team/:id
export const removeAdmin = async (req: Request<{ id: string }>, res: Response) => {
  const id = req.params.id;
  if (String(req.user!._id) === id) {
    throw new AppError(400, "You can't remove your own admin rights. Ask another admin to do it.");
  }

  const user = OBJECT_ID.test(id) ? await User.findById(id) : null;
  if (!user || user.role !== "admin") {
    throw new AppError(404, "That admin wasn't found.");
  }

  // The shop must always keep at least one admin
  if ((await User.countDocuments({ role: "admin" })) <= 1) {
    throw new AppError(400, "QuickCart needs at least one admin.");
  }

  user.role = "customer";
  await user.save();
  res.json({ message: `${user.firstName} ${user.lastName} is no longer an admin.` });
};
