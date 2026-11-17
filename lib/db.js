// MongoDB connection with a module-level cache so serverless functions (Vercel)
// reuse a single connection between invocations.
import mongoose from 'mongoose';

// Unknown fields in filters are dropped. Query-operator injection is prevented by
// validating every user input with Zod (lib/content-schema.js) so filters only ever
// receive primitive values.
mongoose.set('strictQuery', true);

let cached = globalThis.__mongoose;
if (!cached) cached = globalThis.__mongoose = { conn: null, promise: null };

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not configured');
  if (cached.conn && cached.conn.connection.readyState === 1) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, { bufferCommands: false, maxPoolSize: 10, serverSelectionTimeoutMS: 8000 })
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;
