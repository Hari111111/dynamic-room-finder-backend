import mongoose from 'mongoose';
import { env } from './env';

export async function connectDatabase() {
  if (!env.mongoUri) {
    throw new Error('MONGODB_URI is missing. Add it to backend/.env before starting the server.');
  }

  await mongoose.connect(env.mongoUri);
}
