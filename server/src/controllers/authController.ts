// authController.ts server/src/controllers/authController.ts
// Create an account, log in, "who am I", log out, and "is this email free?"

// STEP 18 (part 3): The auth controller
// POST /api/auth/register           -> create an account, reply with a token
// POST /api/auth/login              -> check email + password, reply with a token
// GET  /api/auth/me                 -> the logged-in user          (protect)
// POST /api/auth/logout             -> "logged out"                (protect)
// GET  /api/auth/check-email?email= -> { available: true/false }  (the "Available" tick)
// STEP 19 (part 4): Forgot / reset password and verify email
// POST /api/auth/forgot-password       -> "email" a reset link
// GET  /api/auth/reset-password/:token -> is this link still good? (to show "Link Expired" straight away)
// POST /api/auth/reset-password/:token -> set the new password
// POST /api/auth/send-verification     -> "email" a 6-digit code    (protect)
// POST /api/auth/verify-email          -> check the code            (protect)

import { Request, Response } from "express";
import { OAuth2Client, type TokenPayload } from "google-auth-library";
import { HydratedDocument } from "mongoose";
import { IUser, User } from "../models/User";
import { AppError } from "../utils/AppError";
import { signToken } from "../utils/token";
import { checkNewPassword } from "../utils/password";
import { env } from "../config/env";
import { hashSecret, makeCode, makeResetToken } from "../utils/secrets";
import { sendEmail } from "../utils/sendEmail";

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

  // 8+ characters, uppercase, number, and both passwords match (utils/password.ts)
  checkNewPassword(password, confirmPassword);

  // Pick the fields one by one. NEVER do User.create(req.body): someone could send "role": "admin"!
  // Missing names or a bad email -> the model's messages (400). Email already used -> 409.
  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
  });

  // Email the verification code straight away, so it's waiting in the inbox when the Verify page opens
  const verification = await sendVerificationCode(user);

  // 201 = "created". Log them straight in by sending a token too.
  // The user's toJSON (STEP 17) removes the password from the reply.
  res.status(201).json({ token: signToken(String(user._id)), user, verification });
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

  // A shopper who never verified their email gets a fresh code now, and the website opens the Verify page.
  // (Admins and verified shoppers log in as usual: no code.)
  const verification =
    !user.isEmailVerified && user.role !== "admin"
      ? await sendVerificationCode(user)
      : undefined;

  res.json({
    token: signToken(String(user._id), Boolean(rememberMe)),
    user,
    verification,
  });
};

// ---- "Continue with Google" -----------------------------------------------------------------
// The website shows Google's own button. When the person picks their Google account, Google gives the website
// a signed "ID token" (a JWT) saying who they are. The website sends it here; we check with Google that it's
// genuine and meant for OUR app, then log the person in (or create their account).

const googleClient = new OAuth2Client();

// Find the account for this Google person, or make one.
//   1. Already linked (same googleId)            -> that account
//   2. An account with the same email exists     -> link Google to it (Google has confirmed they own the email)
//   3. Nobody                                     -> a new, already-verified account with no password
// Admin accounts are never opened with Google: staff sign in with their password.
export const findOrCreateGoogleUser = async (google: TokenPayload) => {
  const email = String(google.email).toLowerCase();

  let user: HydratedDocument<IUser> | null = await User.findOne({
    googleId: google.sub,
  }).select("+googleId");
  let isNew = false;

  if (!user) {
    user = await User.findOne({ email }).select("+googleId");
    if (user) {
      if (user.role === "admin") {
        throw new AppError(403, "Admin accounts sign in with their email and password.");
      }
      user.googleId = google.sub;
      user.isEmailVerified = true; // Google has verified this email
      await user.save();
    }
  }

  if (!user) {
    const nameParts = (google.name ?? "").trim().split(/\s+/);
    user = await User.create({
      firstName: google.given_name || nameParts[0] || email.split("@")[0],
      lastName: google.family_name || nameParts.slice(1).join(" ") || "Shopper",
      email,
      googleId: google.sub,
      isEmailVerified: true,
    });
    isNew = true;
  }

  if (user.role === "admin") {
    throw new AppError(403, "Admin accounts sign in with their email and password.");
  }
  return { user, isNew };
};

// POST /api/auth/google   { "credential": "<the ID token Google gave the website>" }
export const googleSignIn = async (req: Request, res: Response) => {
  if (!env.googleClientId) {
    throw new AppError(503, "Google sign-in isn't set up yet. Please use your email and password.");
  }

  const credential = typeof req.body?.credential === "string" ? req.body.credential : "";
  if (!credential) {
    throw new AppError(400, "Google didn't send a sign-in token. Please try again.");
  }

  // Checks Google's signature, that it hasn't expired, and that it was made for OUR Client ID ("audience")
  let google: TokenPayload | undefined;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: env.googleClientId,
    });
    google = ticket.getPayload();
  } catch {
    throw new AppError(401, "Google sign-in didn't work. Please try again.");
  }

  if (!google?.sub || !google.email || !google.email_verified) {
    throw new AppError(401, "Your Google account needs a verified email address to sign in.");
  }

  const { user, isNew } = await findOrCreateGoogleUser(google);

  // 201 when the account was just created, like register. Google sign-ins stay logged in (like "Remember me").
  res.status(isNew ? 201 : 200).json({ token: signToken(String(user._id), true), user });
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

// Reset links and email codes stop working after 15 minutes (the design: "15-minute validity window")
const FIFTEEN_MINUTES = 15 * 60 * 1000; // in milliseconds

// POST /api/auth/forgot-password   { "email": "ada.obi@example.com" }
export const forgotPassword = async (req: Request, res: Response) => {
  const email = String(req.body?.email ?? "")
    .toLowerCase()
    .trim();

  if (!email) {
    throw new AppError(400, "Please enter your email address.");
  }

  // The SAME reply whether the account exists or not (don't tell strangers who has an account)
  const reply: { message: string; devResetUrl?: string } = {
    message:
      "If an account exists for that email, we've sent a link to reset your password.",
  };

  const user = await User.findOne({ email });

  if (user) {
    // 1. A new random token. Asking again replaces the old one, so only the newest link works.
    const { token, hashed } = makeResetToken();
    user.passwordResetToken = hashed; // only the hash is saved
    user.passwordResetExpires = new Date(Date.now() + FIFTEEN_MINUTES);
    await user.save(); // the password isn't modified, so the pre("save") hook doesn't re-hash anything

    // 2. "Email" the link to the reset screen on the website
    const resetUrl = `${env.clientUrl}/reset-password/${token}`;
    await sendEmail(
      user.email,
      "Reset your QuickCart password",
      `Hi ${user.firstName},\n\nClick this link to choose a new password (it works once, for 15 minutes):\n${resetUrl}\n\nIf you didn't ask for this, ignore this email.`,
    );

    // 3. Demo mode only: also put the link in the reply, so a demo needs no inbox
    if (env.demoMode) {
      reply.devResetUrl = resetUrl;
    }
  }

  res.json(reply);
};

// Finds the user a reset link belongs to, or refuses with the "Link Expired or Invalid" message.
// Used by both reset routes below.
const findUserByResetToken = async (token: string) => {
  const user = await User.findOne({
    passwordResetToken: hashSecret(token), // hash what's in the link and look for the same hash
    passwordResetExpires: { $gt: new Date() }, // $gt = "greater than": the expiry time is still in the future
  }).select("+password"); // needed to check "different from your old password"

  if (!user) {
    throw new AppError(
      400,
      "This password reset link has expired or has already been used. Please request a new link.",
    );
  }

  return user;
};

// GET /api/auth/reset-password/:token
// The reset screen calls this when it opens, to show "Link Expired or Invalid" BEFORE the user types anything
export const checkResetToken = async (
  req: Request<{ token: string }>,
  res: Response,
) => {
  await findUserByResetToken(req.params.token);
  res.json({ valid: true });
};

// POST /api/auth/reset-password/:token   { "password": "...", "confirmPassword": "..." }
export const resetPassword = async (
  req: Request<{ token: string }>,
  res: Response,
) => {
  const user = await findUserByResetToken(req.params.token);
  const password = checkNewPassword(
    req.body?.password,
    req.body?.confirmPassword,
  );

  // "Your new password must be different from previous passwords" (the design)
  if (await user.comparePassword(password)) {
    throw new AppError(
      400,
      "Your new password must be different from your old password.",
    );
  }

  user.password = password; // the pre("save") hook hashes it AND sets passwordChangedAt
  user.passwordResetToken = undefined; // undefined = remove the field: the link can't be used twice
  user.passwordResetExpires = undefined;
  await user.save();

  // passwordChangedAt changed, so protect (STEP 18) now refuses every OLDER token: all other devices are logged out.
  // This device gets a fresh token, so the user is logged in straight away.
  res.json({
    message: "Your password has been reset.",
    token: signToken(String(user._id)),
    user,
  });
};

// POST /api/auth/send-verification   (protect: must be logged in)
// Make a new 6-digit code, save its scrambled copy, and email the real one.
// Used by sign-up and by an unverified shopper's login (the code arrives without asking), and by
// "Send a new code" (sendVerification below). Demo mode also returns the code, so a demo needs no inbox.
const sendVerificationCode = async (user: HydratedDocument<IUser>) => {
  const { code, hashed } = makeCode();
  user.emailVerifyToken = hashed;
  user.emailVerifyExpires = new Date(Date.now() + FIFTEEN_MINUTES);
  await user.save();

  await sendEmail(
    user.email,
    "Your QuickCart verification code",
    `Hi ${user.firstName},\n\nYour verification code is ${code}. It expires in 15 minutes.`,
  );

  const reply: { message: string; devCode?: string } = {
    message: `We've sent a 6-digit code to ${user.email}.`,
  };
  if (env.demoMode) {
    reply.devCode = code;
  }
  return reply;
};

export const sendVerification = async (req: Request, res: Response) => {
  const user = req.user!; // "!" = "protect ran first, so this is definitely set"

  if (user.isEmailVerified) {
    throw new AppError(400, "Your email is already verified.");
  }

  res.json(await sendVerificationCode(user));
};

// POST /api/auth/verify-email   { "code": "048213" }   (protect)
export const verifyEmail = async (req: Request, res: Response) => {
  const code = String(req.body?.code ?? "").trim();

  // req.user was loaded WITHOUT the secret fields (select: false), so load them now
  const user = await User.findById(req.user!._id).select(
    "+emailVerifyToken +emailVerifyExpires",
  );

  if (!user) {
    throw new AppError(
      401,
      "This account no longer exists. Please log in again.",
    );
  }

  if (user.isEmailVerified) {
    throw new AppError(400, "Your email is already verified.");
  }

  // No code saved, code too old, or the hash doesn't match -> one message for all three
  const expired =
    !user.emailVerifyExpires || user.emailVerifyExpires.getTime() < Date.now();

  if (!code || expired || user.emailVerifyToken !== hashSecret(code)) {
    throw new AppError(
      400,
      "That code is wrong or has expired. Please request a new one.",
    );
  }

  user.isEmailVerified = true;
  user.emailVerifyToken = undefined;
  user.emailVerifyExpires = undefined;
  await user.save();

  res.json({ message: "Your email is verified.", user });
};
