import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AxiosError,
  AxiosHeaders,
  isCancel,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from 'axios';
import { createSessionStore } from '../src/features/auth/session';
import { createApiClients } from '../src/services/api/create-client';
import { safeAuthRedirect } from '../src/features/auth/redirect';
import { loginSchema, registerSchema } from '../src/features/auth/schemas';
import { ru } from '../src/i18n/messages/ru';

function response(
  config: InternalAxiosRequestConfig,
  data: unknown,
  status = 200,
): AxiosResponse {
  return {
    config,
    data,
    status,
    statusText: String(status),
    headers: new AxiosHeaders(),
  };
}
function unauthorized(config: InternalAxiosRequestConfig, status = 401): never {
  throw new AxiosError(
    'Unauthorized',
    'ERR_BAD_REQUEST',
    config,
    undefined,
    response(config, {}, status),
  );
}
function setup() {
  const storage = new Map<string, string>();
  const session = createSessionStore(() => ({
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => {
      storage.set(key, value);
    },
    removeItem: (key) => {
      storage.delete(key);
    },
  }));
  session.initialize();
  session.signIn('expired-access', 'refresh-one');
  return {
    ...createApiClients('http://test.invalid', session),
    session,
    storage,
  };
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

test('parallel 401 responses share one refresh and replay with new bearer', async () => {
  const { api, publicApi, session } = setup();
  let refreshCount = 0;
  let requestCount = 0;
  const gate = deferred<void>();
  publicApi.defaults.adapter = async (config) => {
    refreshCount++;
    await gate.promise;
    return response(config, {
      access_token: 'new-access',
      refresh_token: 'refresh-two',
    });
  };
  api.defaults.adapter = async (config) => {
    requestCount++;
    if (config.headers.get('Authorization') === 'Bearer expired-access')
      unauthorized(config);
    return response(config, { ok: true });
  };
  const requests = [
    api.get('/users/me'),
    api.get('/users/me'),
    api.get('/users/me'),
  ];
  await new Promise((resolve) => setTimeout(resolve, 10));
  gate.resolve();
  const results = await Promise.all(requests);
  assert.equal(results.length, 3);
  assert.equal(refreshCount, 1);
  assert.equal(requestCount, 6);
  assert.equal(session.getSnapshot().refreshToken, 'refresh-two');
});
test('replayed 401 ends the session without a refresh loop', async () => {
  const { api, publicApi, session } = setup();
  let count = 0;
  let refreshes = 0;
  api.defaults.adapter = async (config) => {
    count++;
    return unauthorized(config);
  };
  publicApi.defaults.adapter = async (config) => {
    refreshes++;
    return response(config, { access_token: 'still-invalid' });
  };
  await assert.rejects(api.get('/users/me'));
  assert.equal(count, 2);
  assert.equal(refreshes, 1);
  assert.equal(session.getSnapshot().refreshToken, null);
});
test('refresh rejection clears the session and is never intercepted recursively', async () => {
  const { api, publicApi, session } = setup();
  let refreshes = 0;
  api.defaults.adapter = async (config) => unauthorized(config);
  publicApi.defaults.adapter = async (config) => {
    refreshes++;
    return unauthorized(config);
  };
  await assert.rejects(api.get('/users/me'));
  assert.equal(refreshes, 1);
  assert.equal(session.getSnapshot().accessToken, null);
});
test('transient refresh network failure preserves credentials for a later retry', async () => {
  const { api, publicApi, session } = setup();
  api.defaults.adapter = async (config) => unauthorized(config);
  publicApi.defaults.adapter = async (config) => {
    throw new AxiosError('Offline', 'ERR_NETWORK', config);
  };
  await assert.rejects(api.get('/users/me'));
  assert.equal(session.getSnapshot().refreshToken, 'refresh-one');
});
test('logout during refresh cannot resurrect a session or replay a request', async () => {
  const { api, publicApi, session } = setup();
  const started = deferred<void>();
  const finish = deferred<void>();
  let requests = 0;
  api.defaults.adapter = async (config) => {
    requests++;
    return unauthorized(config);
  };
  publicApi.defaults.adapter = async (config) => {
    started.resolve();
    await finish.promise;
    return response(config, {
      access_token: 'late-access',
      refresh_token: 'late-refresh',
    });
  };
  const pending = api.get('/users/me');
  await started.promise;
  session.clear();
  finish.resolve();
  await assert.rejects(pending, (error) => isCancel(error));
  assert.equal(session.getSnapshot().accessToken, null);
  assert.equal(requests, 1);
});
test('a late response from an old account is discarded after account switch', async () => {
  const { api, session } = setup();
  const started = deferred<void>();
  const finish = deferred<void>();
  api.defaults.adapter = async (config) => {
    started.resolve();
    await finish.promise;
    return response(config, { username: 'old-user' });
  };
  const pending = api.get('/users/me');
  await started.promise;
  session.signIn('other-access', 'other-refresh');
  finish.resolve();
  await assert.rejects(pending, (error) => isCancel(error));
});
test('refresh restores access after reload and only refresh token is persisted', async () => {
  const { storage, session, api, publicApi } = setup();
  assert.equal(storage.size, 1);
  assert.equal(storage.get('lingua-refresh'), 'refresh-one');
  session.rotate('new-access', 'refresh-two', session.getSnapshot().generation);
  assert.equal(storage.get('lingua-refresh'), 'refresh-two');
  const restored = createSessionStore(() => ({
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => {
      storage.set(key, value);
    },
    removeItem: (key) => {
      storage.delete(key);
    },
  }));
  restored.initialize();
  assert.equal(restored.getSnapshot().accessToken, null);
  assert.equal(restored.getSnapshot().refreshToken, 'refresh-two');
  const restoredClients = createApiClients('http://test.invalid', restored);
  restoredClients.publicApi.defaults.adapter = async (config) =>
    response(config, { access_token: 'restored' });
  restoredClients.api.defaults.adapter = async (config) => {
    assert.equal(config.headers.get('Authorization'), 'Bearer restored');
    return response(config, {});
  };
  await restoredClients.api.get('/users/me');
  assert.ok(api);
  assert.ok(publicApi);
});
test('unexpected refresh payload fails closed', async () => {
  const { api, publicApi, session } = setup();
  api.defaults.adapter = async (config) => unauthorized(config);
  publicApi.defaults.adapter = async (config) =>
    response(config, { message: 'ok' });
  await assert.rejects(api.get('/users/me'));
  assert.equal(session.getSnapshot().refreshToken, null);
});
test('auth redirects reject external targets and auth loops', () => {
  for (const input of [
    'https://evil.invalid',
    '//evil.invalid',
    '/login',
    '/dashboard\\evil',
    '/dashboard-not-real',
  ])
    assert.equal(safeAuthRedirect(input), '/dashboard');
  assert.equal(
    safeAuthRedirect('/dashboard?view=welcome'),
    '/dashboard?view=welcome',
  );
});
test('registration uses Swagger boundaries without restricting login passwords', () => {
  const valid = {
    email: 'person@example.com',
    username: 'abc',
    password: '12345678',
  };
  assert.equal(registerSchema(ru.auth).safeParse(valid).success, true);
  assert.equal(
    registerSchema(ru.auth).safeParse({ ...valid, username: 'ab' }).success,
    false,
  );
  assert.equal(
    registerSchema(ru.auth).safeParse({ ...valid, password: '1234567' })
      .success,
    false,
  );
  assert.equal(
    registerSchema(ru.auth).safeParse({ ...valid, password: 'x'.repeat(101) })
      .success,
    false,
  );
  assert.equal(
    loginSchema(ru.auth).safeParse({ email: valid.email, password: 'x' })
      .success,
    true,
  );
});
