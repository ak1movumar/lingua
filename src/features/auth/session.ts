export type SessionSnapshot = {
  ready: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  generation: number;
};
type StoragePort = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export function createSessionStore(getStorage: () => StoragePort | undefined) {
  let state: SessionSnapshot = {
    ready: false,
    accessToken: null,
    refreshToken: null,
    generation: 0,
  };
  const listeners = new Set<() => void>();
  const publish = (next: SessionSnapshot) => {
    state = next;
    listeners.forEach((listener) => listener());
  };
  const persist = (token: string | null) => {
    try {
      const storage = getStorage();
      if (token) storage?.setItem('lingua-refresh', token);
      else storage?.removeItem('lingua-refresh');
    } catch {
      /* Memory-only session remains usable if browser storage is blocked. */
    }
  };
  return {
    getSnapshot: () => state,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    initialize() {
      if (state.ready) return;
      let refreshToken: string | null = null;
      try {
        refreshToken = getStorage()?.getItem('lingua-refresh') || null;
      } catch {
        /* Storage is optional. */
      }
      publish({ ...state, ready: true, refreshToken });
    },
    signIn(accessToken: string, refreshToken: string) {
      persist(refreshToken);
      publish({
        ready: true,
        accessToken,
        refreshToken,
        generation: state.generation + 1,
      });
    },
    rotate(accessToken: string, refreshToken: string, generation: number) {
      if (generation !== state.generation) return false;
      persist(refreshToken);
      publish({ ...state, accessToken, refreshToken });
      return true;
    },
    clear() {
      persist(null);
      publish({
        ready: true,
        accessToken: null,
        refreshToken: null,
        generation: state.generation + 1,
      });
    },
  };
}
export type SessionStore = ReturnType<typeof createSessionStore>;
export const sessionStore = createSessionStore(() =>
  typeof window === 'undefined' ? undefined : window.sessionStorage,
);
export const serverSession: SessionSnapshot = {
  ready: false,
  accessToken: null,
  refreshToken: null,
  generation: 0,
};
