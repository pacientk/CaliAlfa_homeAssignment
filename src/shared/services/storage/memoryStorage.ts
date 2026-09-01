import type { KeyValueStorage } from './KeyValueStorage';

/**
 * An in-memory {@link KeyValueStorage}. It ships in `src/` rather than in a test folder
 * because two different test suites bind to it — the queue's own, and the hook tests in
 * T-006 — and because a double that lives beside the interface it implements is the one
 * that gets updated when the interface changes.
 *
 * It is deliberately not a singleton: a test that wants to prove data survived a restart
 * keeps the storage and discards everything above it.
 */
export const createMemoryStorage = (): KeyValueStorage => {
  const entries = new Map<string, string>();

  return {
    getString: (key: string): string | undefined => entries.get(key),
    set: (key: string, value: string): void => {
      entries.set(key, value);
    },
    delete: (key: string): void => {
      entries.delete(key);
    },
  };
};
