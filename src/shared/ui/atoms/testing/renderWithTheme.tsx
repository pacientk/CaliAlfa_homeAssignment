import { ThemeProvider } from '@ui/tokens';
import type { ReactElement } from 'react';
import type { ReactTestInstance, ReactTestRenderer } from 'react-test-renderer';
import { act, create } from 'react-test-renderer';

/**
 * Test support for the atom layer, shared by every atom's own tests.
 *
 * It lives in a `testing/` folder rather than a `__tests__/` one on purpose: Jest's default
 * `testMatch` claims everything under `__tests__`, and a support module placed there fails
 * the run with "your test suite must contain at least one test".
 *
 * Atoms require the provider to render — `useTheme` throws outside it by design — so there is
 * no version of these helpers that renders an atom bare.
 */
export const renderWithTheme = (element: ReactElement): ReactTestRenderer => {
  let renderer: ReactTestRenderer | undefined;

  act(() => {
    renderer = create(<ThemeProvider>{element}</ThemeProvider>);
  });

  if (renderer === undefined) {
    throw new Error('renderWithTheme: react-test-renderer returned nothing.');
  }

  return renderer;
};

/**
 * Reads one prop off a rendered host element.
 *
 * `ReactTestInstance.props` is typed as an index signature of `any`, which is exactly the
 * shape the project bans. Funnelling every read through here means the assertion happens once,
 * in test support, instead of in every assertion in every atom's tests.
 */
export const readProp = <TValue,>(instance: ReactTestInstance, name: string): TValue => {
  const value: unknown = instance.props[name];

  // The caller names the prop and therefore knows its type; the renderer cannot.
  return value as TValue;
};

/** Reads a callback off a rendered host element, failing loudly when it is not one. */
export const readHandler = <TArgs extends unknown[]>(
  instance: ReactTestInstance,
  name: string,
): ((...args: TArgs) => unknown) => {
  const value: unknown = instance.props[name];

  if (typeof value !== 'function') {
    throw new Error(`readHandler: "${name}" is not a function on this element.`);
  }

  // Narrowed to a callable above; the signature comes from the caller's declared argument list.
  return value as (...args: TArgs) => unknown;
};

/**
 * The first match, or a failure that names what was missing. `noUncheckedIndexedAccess` makes
 * every index access optional, and a test that reaches for `[0]` should say what it expected
 * rather than fail later on a property of `undefined`.
 */
export const firstOf = <TItem,>(items: readonly TItem[], what: string): TItem => {
  const [first] = items;

  if (first === undefined) {
    throw new Error(`Expected at least one ${what} in the rendered tree.`);
  }

  return first;
};
