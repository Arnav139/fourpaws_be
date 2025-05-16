import * as dotenv from "dotenv";
import { baseSepolia, polygon, polygonAmoy } from "viem/chains";
dotenv.config();
import { z } from "zod";

const envVarsSchema = z.object({
  PORT: z.string(),
  DB_URL: z.string(),
  NODEMAILER_PASSKEY: z.string(),
  NODEMAILER_USER: z.string(),
  JWT_SECRET: z.string(),
  EXPIREATION_MINUTE: z.string(),
  REDIS_URL: z.string(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  AUDIENCE: z.string(),
  CASHFREE_APP_ID: z.string(),
  CASHFREE_SECRET_KEY: z.string(),
  CASHFREE_ENV: z.string(),
});

const envVars = envVarsSchema.parse(process.env);
export const envConfigs = {
  port: envVars.PORT || 8080,
  jwtsecret: envVars.JWT_SECRET,
  db_url: envVars.DB_URL,
  accessExpirationMinutes: envVars.EXPIREATION_MINUTE,
  nodemailerApikey: envVars.NODEMAILER_PASSKEY,
  nodemailerUser: envVars.NODEMAILER_USER,
  cloudinaryCloudName: envVars.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: envVars.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: envVars.CLOUDINARY_API_SECRET,
  AUDIENCE: envVars.AUDIENCE,
  CASHFREE_APP_ID : envVars.CASHFREE_APP_ID,
  CASHFREE_SECRET_KEY : envVars.CASHFREE_SECRET_KEY,
  CASHFREE_ENV : envVars.CASHFREE_ENV,
};
