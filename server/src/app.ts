// app.ts
// Creates the Express app: settings first, then all the /api routes, then the "not found" and error handlers.
// it does not start listening; server.ts does that

import express from "express";
import cors from "cors";
import { env } from "./config/env";
import routes from "./routes";
import { notFound } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";

// STEP 3: Create the Express app
// The Express app: allow the website to call us (CORS), read JSON bodies, server uploaded photos, put every route under /api, then the 404 and error handlers.

const app = express();

app.use(cors({ origin: env.clientUrl, credentials: true })); // let the website (CLIENT_URL) call the API
app.use(express.json());

app.use("/api", routes); // every route lives under /api, e.g. /api/health

app.use(notFound); // must come after the routes: runs only when nothing above matched
app.use(errorHandler) // must be last: catches errors thrown by any route above

export default app;
// Next: STEP 4 (Handle unknown URLs and errors) -> server/src/middleware/notFound.ts
