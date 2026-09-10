import "server-only";
import { Db, MongoClient } from "mongodb";
import { loadEnv } from "@/lib/env";

loadEnv();

const databaseName = process.env.MONGODB_DB || "revile";
const globalForMongo = globalThis as typeof globalThis & { mongoClient?: Promise<MongoClient> };
export async function getDb(): Promise<Db> {
  if (!process.env.MONGODB_URI) throw new Error("Missing MONGODB_URI environment variable.");
  const client = globalForMongo.mongoClient ?? new MongoClient(process.env.MONGODB_URI).connect();
  if (process.env.NODE_ENV !== "production") globalForMongo.mongoClient = client;
  return (await client).db(databaseName);
}
