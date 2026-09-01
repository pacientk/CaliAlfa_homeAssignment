import { MMKV } from 'react-native-mmkv';

import type { KeyValueStorage } from './KeyValueStorage';

/** One named instance, so the app's data is not mixed into MMKV's default store. */
const STORAGE_ID = 'focus-flow';

let instance: MMKV | undefined;

/**
 * Constructed on first use, not at import time. MMKV's constructor reaches for the JSI
 * bindings, which do not exist in a Jest process; a module-level instance would make
 * importing this barrel fatal in every test that touches storage.
 */
const getInstance = (): MMKV => {
  instance ??= new MMKV({ id: STORAGE_ID });
  return instance;
};

/** The production {@link KeyValueStorage}: MMKV, synchronous, survives a process restart. */
export const mmkvStorage: KeyValueStorage = {
  getString: (key: string): string | undefined => getInstance().getString(key),
  set: (key: string, value: string): void => {
    getInstance().set(key, value);
  },
  delete: (key: string): void => {
    getInstance().delete(key);
  },
};
