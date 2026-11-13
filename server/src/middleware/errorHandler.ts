// errorHandler.ts
// The last middleware: turns ANY error thrown in a route into a JSON reply with the right status code, so the server never crashes and the website always gets {message: "..."}

import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import mongoose from "mongoose";

// STEP 14: Handle unknown URLs and errors
// notFound.ts answers "no route matched": this file answers " a route matched but something went wrong"

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction, // not used, but express only treats a middleware as an error handler when it has 4 parameters
) => {
  // 1. Our own errors: throw new AppError(404, "Product not found")
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  //   2. A record broke the models rules (e.g required field missing, price below 0)
  if (error instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(error.errors).map((field) => {
      return field.message;
    });

    return res.status(400).json({ message: messages.join(". ") });
  }

  //   3. A badly formed id, e.g GET /api/products/123 ("123" is not a mongodb id)
  if (error instanceof mongoose.Error.CastError) {
    return res
      .status(400)
      .json({ message: `Invalid ${error.path}: ${String(error.value)}` });
  }

  //   The remaining errors arent classes we can check with instanceof, so we look at their fields
  const err = error as {
    code?: number;
    keyValue?: Record<string, unknown>;
    type?: string;
    name?: string;
  };

  //   4. A "unique" field already used, e.g registring with an email that exists (MongoDB code 11000)

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? "values";
    return res
      .status(409)
      .json({ message: `That ${field} is already in use.` });
  }

  //   5. The website sent broken JSON (express.json() couldnt read the body)
  if (err.type === "entity.parse.failed") {
    return res
      .status(400)
      .json({ message: "The request body is not valid JSON" });
  }

  //   6. A bad or expired login token
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res
      .status(401)
      .json({ message: "Your session has expired. Please log in again." });
  }

  //   7. Anything else is a bug on our side: log the details for us, send a polite message to the user (never send real error to the browser, it can reveal how the server works)
  console.error(error);
  return res
    .status(500)
    .json({ message: "Something went wrong on our side. Please try again." });
};
