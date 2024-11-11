import { MongoClient, ServerApiVersion } from "mongodb";
import { env } from "./env";

let dbInstance = null;

const clientInstance = new MongoClient(env.mongoUri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
});

export const connectToMongodb = async () => {
  await clientInstance.connect();
  dbInstance = clientInstance.db(env.db_name);
};

export const getDbInstance = () => {
  if (!dbInstance) {
    throw new Error("Database is not connected!");
  }
  return dbInstance;
};

export const closeMongodb = async () => {
  await clientInstance.close();
  dbInstance = null;
};
