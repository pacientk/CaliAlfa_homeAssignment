import { readJson, writeJson } from '../jsonStorage';
import { createMemoryStorage } from '../memoryStorage';

const KEY = 'focus-flow.test-key';

interface Note {
  title: string;
}

const parseNote = (raw: unknown): Note | undefined => {
  if (typeof raw !== 'object' || raw === null) {
    return undefined;
  }
  const title = (raw as Record<string, unknown>).title;
  return typeof title === 'string' ? { title } : undefined;
};

describe('createMemoryStorage — it must behave exactly as MMKV does', () => {
  it('returns undefined for a key that was never written', () => {
    expect(createMemoryStorage().getString(KEY)).toBeUndefined();
  });

  it('reads back the value that was written', () => {
    const storage = createMemoryStorage();
    storage.set(KEY, 'value');
    expect(storage.getString(KEY)).toBe('value');
  });

  it('overwrites a key on a second write', () => {
    const storage = createMemoryStorage();
    storage.set(KEY, 'first');
    storage.set(KEY, 'second');
    expect(storage.getString(KEY)).toBe('second');
  });

  it('forgets a deleted key', () => {
    const storage = createMemoryStorage();
    storage.set(KEY, 'value');
    storage.delete(KEY);
    expect(storage.getString(KEY)).toBeUndefined();
  });

  it('keeps two instances independent, so a test can discard one and keep the other', () => {
    const first = createMemoryStorage();
    const second = createMemoryStorage();
    first.set(KEY, 'value');
    expect(second.getString(KEY)).toBeUndefined();
  });
});

describe('readJson and writeJson', () => {
  it('round-trips a value through storage', () => {
    const storage = createMemoryStorage();
    writeJson(storage, KEY, { title: 'Ship the queue' });
    expect(readJson(storage, KEY, parseNote)).toEqual({ title: 'Ship the queue' });
  });

  it('writes JSON text, so the stored form is inspectable and portable', () => {
    const storage = createMemoryStorage();
    writeJson(storage, KEY, { title: 'Ship the queue' });
    expect(storage.getString(KEY)).toBe('{"title":"Ship the queue"}');
  });

  it('reads undefined for a key that was never written', () => {
    expect(readJson(createMemoryStorage(), KEY, parseNote)).toBeUndefined();
  });

  it('reads undefined when the stored text is not JSON, rather than throwing', () => {
    const storage = createMemoryStorage();
    storage.set(KEY, '{ this is not json');
    expect(readJson(storage, KEY, parseNote)).toBeUndefined();
  });

  it('reads undefined when the decoded value fails the parser', () => {
    const storage = createMemoryStorage();
    writeJson(storage, KEY, { title: 42 });
    expect(readJson(storage, KEY, parseNote)).toBeUndefined();
  });

  it('clears the key when the value cannot be encoded as JSON', () => {
    const storage = createMemoryStorage();
    writeJson(storage, KEY, { title: 'present' });
    writeJson(storage, KEY, undefined);
    expect(storage.getString(KEY)).toBeUndefined();
  });
});
