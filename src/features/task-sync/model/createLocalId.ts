const RADIX = 36;

let sequence = 0;

/**
 * Mints the ids the queue needs: the placeholder id of a task created offline, and the
 * id of a queue entry.
 *
 * Not a UUID, because Hermes has no `crypto.randomUUID` and pulling in a polyfill to name
 * a value that never leaves the device would be a dependency for nothing. The clock makes
 * it unique across restarts and the counter makes it unique within a millisecond, which
 * is the whole requirement: these ids are compared for equality and never parsed.
 */
export const createLocalId = (): string => {
  sequence += 1;
  return `local-${Date.now().toString(RADIX)}-${sequence.toString(RADIX)}`;
};
