import { z } from 'zod';
const schema = z.object({
  NEXT_PUBLIC_API_URL: z
    .url()
    .refine(
      (value) => ['http:', 'https:'].includes(new URL(value).protocol),
      'API URL must use HTTP or HTTPS',
    ),
});
export const env = schema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});
