import mongoose from "mongoose";

let db;
async function getDB() {
  if (!db) {
    const mongoDBUri = process.env.MONGO_DB_URI;
    db = await mongoose.createConnection(mongoDBUri);
  }
  return db;
}

export async function createModel(name, schema, options) {
  const db = await getDB();
  const modelSchema = new mongoose.Schema(schema, options);
  return db.model(name, modelSchema);
}
