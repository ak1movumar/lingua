'use client';
import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { sessionStore, serverSession } from './session';
import { getMe } from './api';
import { queryKeys } from '@/constants/query-keys';
import { sessionDrafts } from '@/lib/session-drafts';
function useAuthValue() {
  const snapshot = useSyncExternalStore(
    sessionStore.subscribe,
    sessionStore.getSnapshot,
    () => serverSession,
  );
  const queryClient = useQueryClient();
  useEffect(() => {
    sessionStore.initialize();
    let previous = sessionStore.getSnapshot().generation;
    return sessionStore.subscribe(() => {
      const next = sessionStore.getSnapshot().generation;
      if (next !== previous) {
        previous = next;
        sessionDrafts.clear();
        void queryClient.cancelQueries();
        queryClient.clear();
      }
    });
  }, [queryClient]);
  const hasSession =
    snapshot.ready && !!(snapshot.refreshToken || snapshot.accessToken);
  const me = useQuery({
    queryKey: queryKeys.me,
    queryFn: ({ signal }) => getMe(signal),
    enabled: hasSession,
    retry: false,
    staleTime: 60000,
  });
  return {
    ready: snapshot.ready,
    hasSession,
    me,
    user: hasSession ? me.data : undefined,
  };
}
type AuthValue = ReturnType<typeof useAuthValue>;
const AuthContext = createContext<AuthValue | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthValue();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth requires AuthProvider');
  return context;
}
