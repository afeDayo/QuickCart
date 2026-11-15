// server.ts
// The starting point of the API: connect to MongoDB, then start listening for requests.
import app from "./app";
import { connectDB } from "./config/database";
import { env } from "./config/env";

// STEP 6: Start the server
// The starting point: connect to MongoDB first, then start listening on the port. If the database can't be reached, show the error and stop

const startServer = async () => {
  // The built server (npm start) is the real one people log in to. It must not use the made-up JWT secret
  // from env.ts: anyone who reads the code could make their own admin login token with it. (STEP 29)
  if (!__filename.endsWith(".ts") && !process.env.JWT_SECRET) {
    console.error("Add JWT_SECRET to .env before running the built server (a long random text).");
    process.exit(1);
  }

  try {
    await connectDB(); // uses MONGO_URI from the .env file

    app.listen(env.port, () => {
      console.log(`QuickCart API running on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Could not connect to MongoDB:", (error as Error).message);
    process.exit(1);
  }
};

startServer();

// Next: STEP 7 (The Category model) -> server/src/models/Category.ts
