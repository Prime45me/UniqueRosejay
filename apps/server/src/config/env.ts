import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/uniquerosejay'),
  JWT_SECRET: z.string().default('local-dev-secret-change-me'),
  NEXT_PUBLIC_API_URL: z.string().default('http://localhost:4000/api')
});

export const env = envSchema.parse(process.env);
