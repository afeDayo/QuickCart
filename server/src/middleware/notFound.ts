// notFound
// Runs when no route matches the request, and replies with a 404 message.

import { Request, Response } from "express";

// STEP 4 : Handle unknown URLs and errors
// Runs when no route matched: replies 404 as JSON. errorHandler.ts (same step) turns any thrown error into a JSON reply instead of crashing

export const notFound = (req: Request, res: Response) => {
  res
    .status(404)
    .json({ message: `Not found: ${req.method} ${req.originalUrl}` });
};

// Next: STEP 5 (Join the routes and add a health check) -> server/src/routes/index.ts
