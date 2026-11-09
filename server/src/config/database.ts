// database.ts
// Connects to MongoDB using the MONGO_URI from the .env file

import mongoose from "mongoose";
import { env } from "./env";

// STEP 2: connect to MongoDB
// connectDB() opens the connection to MongoDB with the address from .env .server.ts calls it before the API starts.

export const connectDB = async () => {
  const connection = await mongoose.connect(env.mongoUri);
  console.log(`MongoDB connected: ${connection.connection.host}`);
};

// Next: STEP 3 (Create the Express app) -> server/src/app.ts
