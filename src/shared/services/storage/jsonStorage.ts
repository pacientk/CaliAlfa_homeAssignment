import type { KeyValueStorage } from './KeyValueStorage';

/**
 * Typed read of a JSON value.
 *
 * The `parse` callback is required rather than optional because persisted data is not
 * trustworthy input: it was written by an earlier version of this app, it may have been
 * truncated by a crash mid-write, and a shape change between releases would otherwise
 * hand the caller a half-valid object typed as `T`. A value that fails to decode or fails
 * `parse` reads back as `undefined` — the same as never having been written, which is a
 * state every caller already handles.
 */
export const readJson = <T>(
  storage: KeyValueStorage,
  key: string,
  parse: (raw: unknown) => T | undefined,
): T | undefined => {
  const stored = storage.getString(key);
  if (stored === undefined) {
    return undefined;
  }
  try {
    return parse(JSON.parse(stored) as unknown);
  } catch {
    // Unparseable JSON is treated as an absent key rather than thrown: a corrupt entry
    // must not be able to stop the app from starting.
    return undefined;
  }
};

/** Typed write. A value JSON cannot represent clears the key instead of storing `"undefined"`. */
export const writeJson = (storage: KeyValueStorage, key: string, value: unknown): void => {
  const encoded: string | undefined = JSON.stringify(value);
  if (encoded === undefined) {
    storage.delete(key);
    return;
  }
  storage.set(key, encoded);
};
