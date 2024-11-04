import "dotenv/config";

export const env = {
  signature_access_token: process.env.ACCESS_TOKEN_SECRET_SIGNATURE,
  signature_refresh_token: process.env.REFRESH_TOKEN_SECRET_SIGNATURE
};
