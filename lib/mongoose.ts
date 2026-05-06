// This file is deprecated - use database.ts instead
// Keeping for backward compatibility during migration
import getDatabase from './database';

export default async function connectDB() {
  return await getDatabase();
}
