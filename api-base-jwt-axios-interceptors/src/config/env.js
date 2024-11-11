import "dotenv/config";

export const env = {
  signature_access_token: process.env.ACCESS_TOKEN_SECRET_SIGNATURE,
  signature_refresh_token: process.env.REFRESH_TOKEN_SECRET_SIGNATURE,
  db_name: process.env.DATABASE_NAME,
  mongoUri: process.env.MONGODB_URI,
  buildMode: process.env.BUILD_MODE
};
