import mongoose from 'mongoose';

let cached = null

export async function getDb() {
  if (cached) return cached;

  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI Wrong');

  await mongoose.connect(uri);
  cached = mongoose.connection;

  console.log('Mongo connected');
  return cached;
}