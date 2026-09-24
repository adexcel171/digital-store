import mongoose from "mongoose";

let cached = global._mongoose;

if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not set. Create a .env.local file in your project root " +
        "(same folder as package.json) with a line like:\n" +
        "MONGODB_URI=mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/digital-store\n" +
        "Then fully stop and restart `npm run dev`."
    );
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
      })
      .then((mongooseInstance) => mongooseInstance);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null; // allow retry on next request instead of caching a failed connection
    throw err;
  }

  return cached.conn;
}
