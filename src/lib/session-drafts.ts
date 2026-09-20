/** Drafts live in memory only and are cleared with the authenticated session. */
export function createDraftStore() {
  const drafts = new Map<string, string>();
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((listener) => listener());
  return {
    get: (key: string) => drafts.get(key) ?? '',
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    set(key: string, value: string) {
      if ((drafts.get(key) ?? '') === value) return;
      if (value) drafts.set(key, value);
      else drafts.delete(key);
      notify();
    },
    acknowledge(key: string, sentValue: string) {
      if (drafts.get(key) !== sentValue) return;
      drafts.delete(key);
      notify();
    },
    clear() {
      if (!drafts.size) return;
      drafts.clear();
      notify();
    },
  };
}
export const sessionDrafts = createDraftStore();
export const messageDraftKey = (userId: string, chatId: string) =>
  userId + ':' + chatId;
