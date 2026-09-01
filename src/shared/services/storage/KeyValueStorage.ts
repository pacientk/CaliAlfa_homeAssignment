/**
 * The persistence surface the app depends on, deliberately narrow: three synchronous
 * methods, which is exactly the subset of MMKV's API the offline queue uses.
 *
 * It exists so nothing above this layer depends on MMKV itself. The queue takes a
 * `KeyValueStorage`, so its tests run against an in-memory double with no native module
 * and no device, and the production wiring passes the MMKV-backed one. The signatures are
 * MMKV's own — `getString` returning `undefined` for a missing key included — so the
 * double cannot drift into being easier to satisfy than the real thing.
 */
export interface KeyValueStorage {
  /** The stored string, or `undefined` when the key was never written. */
  getString(key: string): string | undefined;
  set(key: string, value: string): void;
  delete(key: string): void;
}
