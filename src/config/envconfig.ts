import * as dotenv from "dotenv";
import { baseSepolia, polygon, polygonAmoy } from "viem/chains";
dotenv.config();
import { z } from "zod";

const envVarsSchema = z.object({
  PORT :z.string(), 
  DB_URL :z.string(),
  NODEMAILER_PASSKEY:z.string(),
  NODEMAILER_USER:z.string(),
  JWT_SECRET: z.string(),
  EXPIREATION_MINUTE:z.string(),
  REDIS_URL:z.string(),

});

const envVars = envVarsSchema.parse(process.env);
export const envConfigs = {
  port: envVars.PORT || 8080,
  jwtsecret:envVars.JWT_SECRET,
  db_url:envVars.DB_URL,
  accessExpirationMinutes:envVars.EXPIREATION_MINUTE,
  nodemailerApikey:envVars.NODEMAILER_PASSKEY,
  nodemailerUser:envVars.NODEMAILER_USER

};






