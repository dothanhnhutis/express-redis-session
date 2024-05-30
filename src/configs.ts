import dotenv from "dotenv";
import z from "zod";
dotenv.config({});

const envSchema = z
  .object({
    NODE_ENV: z.string().default("development"),
    CLIENT_URL: z.string(),
    REDIS_HOST: z.string(),
    SESSION_SECRET: z.string(),
  })
  .strict();

const configParser = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  CLIENT_URL: process.env.CLIENT_URL,
  REDIS_HOST: process.env.REDIS_HOST,
  SESSION_SECRET: process.env.SESSION_SECRET,
});

if (!configParser.success) {
  console.error(configParser.error.issues);
  throw new Error("The values ​​in the env file are invalid");
}

const configs = configParser.data;
export default configs;
