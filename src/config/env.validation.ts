import { z } from 'zod';

export const envSchema = z.object({
  PLANFIX_BASE_URL: z.string().url(),
  PLANFIX_API_TOKEN: z.string().min(10),
  PLANFIX_TIMEOUT_MS: z.string().optional(),
});
