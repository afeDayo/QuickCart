// server.ts
// The starting point of the API: connect to MongoDB, then start listening for requests.
import app from "./app";
import { connectDB } from "./config/database";
import { env } from "./config/env";

// STEP 6: Start the server
// The starting point: connect to MongoDB first, then start listening on the port. If the database can't be reached, show the error and stop

const startServer = async () => {
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

// Next: STEP 7 (The Category model) -> server/src/model/Category.ts
