import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();
const hasExplicitMySqlConfig =
  Boolean(process.env.MYSQL_HOST) &&
  Boolean(process.env.MYSQL_USER) &&
  Boolean(process.env.MYSQL_DATABASE);

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  HOST: z.string().default("0.0.0.0"),
  MYSQL_HOST: z.string().default("127.0.0.1"),
  MYSQL_PORT: z.coerce.number().int().positive().default(3306),
  MYSQL_USER: z.string().default("root"),
  MYSQL_PASSWORD: z.string().default(""),
  MYSQL_DATABASE: z.string().default("civic_intelligence"),
  MYSQL_SSL: z
    .union([z.string(), z.boolean()])
    .optional()
    .transform((value) => value === true || value === "true"),
  MYSQL_POOL_MAX: z.coerce.number().int().positive().default(10),
  CORS_ORIGIN: z.string().default("*"),
  DEFAULT_RADIUS_KM: z.coerce.number().positive().default(5),
  CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(60),
  LOG_LEVEL: z.string().default("info"),
});

const parsed = schema.parse(process.env);

export const env = {
  ...parsed,
  isProduction: parsed.NODE_ENV === "production",
  isDevelopment: parsed.NODE_ENV === "development",
  hasDatabase: hasExplicitMySqlConfig,
};
