import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  ETHEREUM_RPC_URL: z.string().url().optional().or(z.literal('')),
  SEPOLIA_RPC_URL: z.string().url().optional().or(z.literal('')),
  BITCOIN_RPC_URL: z.string().url().optional().or(z.literal('')),
  BITCOIN_RPC_USERNAME: z.string().optional().or(z.literal('')),
  BITCOIN_RPC_PASSWORD: z.string().optional().or(z.literal('')),
  COINGECKO_API_KEY: z.string().optional().or(z.literal('')),
  COINGECKO_BASE_URL: z.string().url().default('https://api.coingecko.com/api/v3'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
}

export const env = parsed.data;
