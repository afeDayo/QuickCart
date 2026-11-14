// secrets.ts server/src/utils/secrets.ts
// Random one-time secrets: the password reset token (in the link) and the 6-digit email code.
// We send the REAL secret to the user and save only its HASH, like a password.

// STEP 19 (part 2): One-time secrets

import crypto from "crypto"; // built into Node, nothing to install

// "1ba4dc03..." -> its sha256 hash (64 characters).
// Why not bcrypt like passwords? bcrypt is slow on purpose and gives a different hash every time, so we couldn't
// FIND a user by it. sha256 always gives the same hash, and the token is long and random, so it's safe.
export const hashSecret = (secret: string) => {
  return crypto.createHash("sha256").update(secret).digest("hex");
};

// The reset link token: 32 random bytes = 64 hex characters, impossible to guess
export const makeResetToken = () => {
  const token = crypto.randomBytes(32).toString("hex");
  return { token, hashed: hashSecret(token) }; // token -> the email, hashed -> the database
};

// The email code: 6 digits, e.g. "048213" (padStart keeps a leading 0, so it's always 6 digits)
export const makeCode = () => {
  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
  return { code, hashed: hashSecret(code) };
};
