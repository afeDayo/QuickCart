// authController.ts server/src/controllers/authController.ts
// Create an account, log in, "who am I", log out, and "is this email free?"

// STEP 18 (part 3): The auth controller
// POST /api/auth/register           -> create an account, reply with a token
// POST /api/auth/login              -> check email + password, reply with a token
// GET  /api/auth/me                 -> the logged-in user          (protect)
// POST /api/auth/logout             -> "logged out"                (protect)
// GET  /api/auth/check-email?email= -> { available: true/false }  (the "Available" tick)

import { Request, Response } from "express";
import { User } from "../models/User";
import { AppError } from "../utils/AppError";
import { signToken } from "../utils/token";

// The rules from the registration screen: 8+ characters, an uppercase letter and a number.
// (?=.*[A-Z]) = "somewhere there is an A-Z", (?=.*\d) = "somewhere there is a 0-9", .{8,} = 8 or more characters
const PASSWORD_RULE = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

// POST /api/auth/register
export const register = async (req: Request, res: Response) => {
  // "?? {}": in Express 5, req.body is undefined when nothing was sent, and destructuring undefined crashes
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    confirmPassword,
    agreeToTerms,
  } = req.body ?? {};

  if (!agreeToTerms) {
    throw new AppError(
      400,
      "Please agree to the Terms of Service and Privacy Policy.",
    );
  }

  // The model only checks "8 characters"; the uppercase + number rules are checked here.
  // (They can't go in the model: the model sees the HASH when it validates on later saves.)
  if (typeof password !== "string" || !PASSWORD_RULE.test(password)) {
    throw new AppError(
      400,
      "Password must be at least 8 characters with one uppercase letter (A-Z) and one number (0-9).",
    );
  }

  if (password !== confirmPassword) {
    throw new AppError(400, "Passwords do not match.");
  }

  // Pick the fields one by one. NEVER do User.create(req.body): someone could send "role": "admin"!
  // Missing names or a bad email -> the model's messages (400). Email already used -> 409.
  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
  });

  // 201 = "created". Log them straight in by sending a token too.
  // The user's toJSON (STEP 17) removes the password from the reply.
  res.status(201).json({ token: signToken(String(user._id)), user });
};

// POST /api/auth/login
export const login = async (req: Request, res: Response) => {
  const { email, password, rememberMe } = req.body ?? {};

  if (!email || !password) {
    throw new AppError(400, "Please enter your email and password.");
  }

  // The password has select: false, so we must ask for it to compare it
  const user = await User.findOne({
    email: String(email).toLowerCase().trim(),
  }).select("+password");

  // The SAME message for "no such email" and "wrong password": don't tell strangers which emails have accounts
  if (!user || !(await user.comparePassword(String(password)))) {
    throw new AppError(401, "Incorrect email or password.");
  }

  res.json({ token: signToken(String(user._id), Boolean(rememberMe)), user });
};

// GET /api/auth/me (after protect, so req.user is already loaded)
// The website calls this when it opens, to know who is logged in (the avatar, "Hi Ada", admin menu).
export const getMe = async (req: Request, res: Response) => {
  res.json({ user: req.user });
};

// POST /api/auth/logout
// Nothing to delete on the server: the website deletes its token. This just confirms it.
export const logout = async (_req: Request, res: Response) => {
  res.json({ message: "You have been logged out." });
};

// GET /api/auth/check-email?email=ada.obi@example.com -> { available: false }
export const checkEmail = async (req: Request, res: Response) => {
  const email = String(req.query.email ?? "")
    .toLowerCase()
    .trim();

  if (!email) {
    throw new AppError(400, "Please give an email to check.");
  }

  const taken = await User.exists({ email }); // exists = cheap "is there one?" (only the _id comes back)
  res.json({ available: !taken });
};
