import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI as string;
let client: MongoClient;
let db: Db;

export async function connectToDatabase() {
  if (!client || !db) {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db();
  }
  return { client, db };
} 