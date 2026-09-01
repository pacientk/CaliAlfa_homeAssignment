import { useEffect, useState } from 'react';

/**
 * The value, once it has stopped changing for `delayMs`.
 *
 * The timer is cleared by the effect's own cleanup, so a keystroke arriving before the delay
 * has elapsed replaces the pending update rather than queueing a second one. That is the
 * whole of the debounce; there is no ref, no mutable timer handle, and nothing to leak when
 * the component unmounts mid-flight.
 */
export const useDebouncedValue = <TValue>(value: TValue, delayMs: number): TValue => {
  const [settled, setSettled] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSettled(value);
    }, delayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);

  return settled;
};
