import { env } from '@/lib/env';
import { sessionStore } from '@/features/auth/session';
import { createApiClients } from './create-client';
export const { api, publicApi, refresh } = createApiClients(
  env.NEXT_PUBLIC_API_URL,
  sessionStore,
);
