import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(5000),

  WEB_ORIGIN: z.string().url().default('http://localhost:3000'),
  CORS_ORIGINS: z.string().default(''),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REDIRECT_URI: z.string().default(''),

  MCP_BASE_URL: z.string().url().default('http://localhost:5000'),
  MCP_AUTH_SECRET: z.string().min(32),

  DATABASE_URL: z.string().min(1),
});

export function validateEnv(config: Record<string, unknown>) {
  return envSchema.parse(config);
}

export type EnvConfig = z.infer<typeof envSchema>;
