// token.ts server/src/utils/token.ts
// Makes login tokens (JWTs) and checks them.

// STEP 18 (part 1): Tokens

import jwt from "jsonwebtoken";
import { env } from "../config/env";

// What is inside one of our tokens once it's checked
export interface TokenPayload {
  id: string; // the user's _id
  iat: number; // "issued at": when it was made, in SECONDS since 1970
  exp: number; // when it stops working, in seconds
}

// signToken("6650...") -> "eyJhbGciOi..."
// rememberMe ("Remember me for 30 days" on the login screen) -> 30 days, otherwise JWT_EXPIRES_IN (15d)
export const signToken = (userId: string, rememberMe = false) => {
  // The "as" is needed because TypeScript only accepts strings like "15d" here, and env gives a plain string
  const expiresIn = (
    rememberMe ? "30d" : env.jwtExpiresIn
  ) as jwt.SignOptions["expiresIn"];

  return jwt.sign({ id: userId }, env.jwtSecret, { expiresIn });
};

// verifyToken("eyJhbGciOi...") -> { id, iat, exp }
// If the token was changed, faked or has expired, jwt.verify THROWS (JsonWebTokenError / TokenExpiredError).
// We don't catch it: errorHandler part 6 (STEP 14) already turns those into a 401.
export const verifyToken = (token: string) => {
  return jwt.verify(token, env.jwtSecret) as TokenPayload;
};
