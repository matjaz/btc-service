import mongoose from "mongoose";

let db: mongoose.Connection;
async function getDB() {
  if (!db) {
    const mongoDBUri = process.env.MONGO_DB_URI;
    if (mongoDBUri) {
      db = await mongoose.createConnection(mongoDBUri);
    } else {
      throw new Error("Missing MONGO_DB_URI");
    }
  }
  return db;
}

export async function createModel<T>(
  name: string,
  schema: any,
  options: any,
): Promise<mongoose.Model<T>> {
  const db = await getDB();
  const modelSchema = new mongoose.Schema<T>(schema, options);
  return db.model<T>(name, modelSchema);
}
