/**
 * The global manual mock for MMKV.
 *
 * MMKV's constructor reaches for JSI bindings that no Jest process has, so any suite that
 * mounts the app's provider stack — which now includes the offline data layer — would fail
 * the moment the store is constructed. The double keeps the same synchronous contract in a
 * `Map`, which is what the storage service's own interface promises anyway.
 *
 * It lives in the root `__mocks__/` per `docs/architecture/conventions.md § Test Code
 * Quality`; Jest applies a `node_modules` mock from there automatically, with no `jest.mock`
 * call in the suite.
 *
 * Each instance owns its own map, so a suite that constructs a second store does not inherit
 * the first one's keys.
 */
export class MMKV {
  private readonly entries = new Map<string, string>();

  public getString(key: string): string | undefined {
    return this.entries.get(key);
  }

  public set(key: string, value: string): void {
    this.entries.set(key, value);
  }

  public delete(key: string): void {
    this.entries.delete(key);
  }

  public clearAll(): void {
    this.entries.clear();
  }
}
