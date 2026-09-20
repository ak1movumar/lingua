import axios, {
  AxiosError,
  CanceledError,
  type InternalAxiosRequestConfig,
} from 'axios';
import {
  AuthContractError,
  refreshResponseSchema,
} from '@/features/auth/contracts';
import type { SessionStore } from '@/features/auth/session';
type AuthRequest = InternalAxiosRequestConfig & {
  _authRetried?: boolean;
  _sessionGeneration?: number;
};
export function createApiClients(baseURL: string, session: SessionStore) {
  const config = {
    baseURL,
    timeout: 15000,
    headers: { Accept: 'application/json' },
  };
  const publicApi = axios.create(config);
  const api = axios.create(config);
  let refreshFlight: { generation: number; promise: Promise<string> } | null =
    null;
  async function refresh(): Promise<string> {
    const snapshot = session.getSnapshot();
    if (!snapshot.refreshToken) throw new CanceledError('No refresh session');
    if (refreshFlight?.generation === snapshot.generation)
      return refreshFlight.promise;
    const generation = snapshot.generation;
    const promise = (async () => {
      try {
        const response = await publicApi.post<unknown>('/auth/refresh', {
          refresh_token: snapshot.refreshToken,
        });
        const parsed = refreshResponseSchema.safeParse(response.data);
        if (
          !parsed.success ||
          (parsed.data.token_type &&
            parsed.data.token_type.toLowerCase() !== 'bearer')
        )
          throw new AuthContractError();
        if (
          !session.rotate(
            parsed.data.access_token,
            parsed.data.refresh_token ?? snapshot.refreshToken!,
            generation,
          )
        )
          throw new CanceledError('Session changed');
        return parsed.data.access_token;
      } catch (error) {
        if (
          session.getSnapshot().generation === generation &&
          (error instanceof AuthContractError ||
            (axios.isAxiosError(error) &&
              [400, 401, 403, 422].includes(error.response?.status ?? 0)))
        )
          session.clear();
        throw error;
      } finally {
        if (refreshFlight?.generation === generation) refreshFlight = null;
      }
    })();
    refreshFlight = { generation, promise };
    return promise;
  }
  api.interceptors.request.use(async (incoming) => {
    const request = incoming as AuthRequest;
    const snapshot = session.getSnapshot();
    if (
      request._sessionGeneration !== undefined &&
      request._sessionGeneration !== snapshot.generation
    )
      throw new CanceledError('Session changed');
    request._sessionGeneration = snapshot.generation;
    const token =
      snapshot.accessToken ?? (snapshot.refreshToken ? await refresh() : null);
    if (session.getSnapshot().generation !== request._sessionGeneration)
      throw new CanceledError('Session changed');
    if (token) request.headers.set('Authorization', 'Bearer ' + token);
    else request.headers.delete('Authorization');
    return request;
  });
  api.interceptors.response.use(
    (response) => {
      const config = response.config as AuthRequest;
      if (config._sessionGeneration !== session.getSnapshot().generation)
        throw new CanceledError('Session changed');
      return response;
    },
    async (error: unknown) => {
      if (!axios.isAxiosError(error)) throw error;
      const request = error.config as AuthRequest | undefined;
      if (!request || error.response?.status !== 401) throw error;
      const snapshot = session.getSnapshot();
      if (request._sessionGeneration !== snapshot.generation)
        throw new CanceledError('Session changed');
      if (request._authRetried) {
        session.clear();
        throw error;
      }
      if (!snapshot.refreshToken) {
        session.clear();
        throw error;
      }
      request._authRetried = true;
      const sent = request.headers.get('Authorization');
      const token =
        snapshot.accessToken && sent !== 'Bearer ' + snapshot.accessToken
          ? snapshot.accessToken
          : await refresh();
      if (session.getSnapshot().generation !== snapshot.generation)
        throw new CanceledError('Session changed');
      request.headers.set('Authorization', 'Bearer ' + token);
      return api.request(request);
    },
  );
  return { api, publicApi, refresh };
}
export { AxiosError };
