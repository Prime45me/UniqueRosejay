import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { z } from 'zod';

/*
 * The shared .env lives at the repository root, but workspace scripts run with apps/server as the
 * working directory. Load the root file explicitly (falling back to a local apps/server/.env) so
 * `npm run dev -w apps/server` and `npm run dev` from the root behave the same.
 * Variables already set in the environment always take precedence.
 */
const here = dirname(fileURLToPath(import.meta.url));
for (const candidate of [resolve(here, '../../../../.env'), resolve(here, '../../.env')]) {
  if (existsSync(candidate)) {
    dotenv.config({ path: candidate });
  }
}

const PLACEHOLDER_SECRETS = new Set(['local-dev-secret-change-me', 'replace-me-with-a-long-random-secret']);

const envSchema = z
  .object({
    PORT: z.coerce.number().int().positive().default(4000),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    DATABASE_URL: z.string().min(1).default('postgresql://postgres:postgres@localhost:5432/uniquerosejay'),
    JWT_SECRET: z.string().default('local-dev-secret-change-me'),
    /** Comma-separated list of browser origins allowed to call the API with credentials. */
    CORS_ORIGINS: z.string().default('http://localhost:3000'),
    NEXT_PUBLIC_API_URL: z.string().default('http://localhost:4000/api')
  })
  .superRefine((value, ctx) => {
    if (value.NODE_ENV === 'production' && (PLACEHOLDER_SECRETS.has(value.JWT_SECRET) || value.JWT_SECRET.length < 32)) {
      ctx.addIssue({
        code: 'custom',
        path: ['JWT_SECRET'],
        message: 'JWT_SECRET must be set to a unique value of at least 32 characters in production'
      });
    }
  });

const parsed = envSchema.parse(process.env);

export const env = {
  ...parsed,
  corsOrigins: parsed.CORS_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
};
