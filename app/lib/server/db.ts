import mongoose from "mongoose";

type CachedConnection = { connection: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
declare global { var mongooseCache: CachedConnection | undefined; }

const cached = global.mongooseCache ?? { connection: null, promise: null };
global.mongooseCache = cached;

export async function connectDatabase() {
  if (cached.connection) return cached.connection;
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error("MONGODB_URI is required for database-backed API routes.");
  if (!cached.promise) cached.promise = mongoose.connect(mongoUri);
  try {
    cached.connection = await cached.promise;
    return cached.connection;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
}