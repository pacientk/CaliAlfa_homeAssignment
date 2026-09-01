import type { JSX } from 'react';
import { act, create } from 'react-test-renderer';

import { ThemeProvider } from '../ThemeProvider';
import { lightTheme } from '../themes/light';
import type { Theme } from '../themes/types';
import { ThemeProviderMissingError, useTheme } from '../useTheme';

/** Renders nothing; it exists so a hook can be called inside a real React tree. */
const makeProbe = (onRead: (theme: Theme) => void): (() => JSX.Element | null) =>
  function Probe(): JSX.Element | null {
    onRead(useTheme());

    return null;
  };

describe('useTheme inside the provider', () => {
  it('returns the light theme with every group populated', () => {
    let received: Theme | undefined;
    const Probe = makeProbe(theme => {
      received = theme;
    });

    act(() => {
      create(
        <ThemeProvider>
          <Probe />
        </ThemeProvider>,
      );
    });

    expect(received).toBe(lightTheme);
    expect(received?.colors.text.primary).toBe(lightTheme.colors.text.primary);
    expect(received?.spacing.space16).toBe(lightTheme.spacing.space16);
    expect(received?.borderRadius.full).toBe(lightTheme.borderRadius.full);
    expect(received?.typography.body).toEqual(lightTheme.typography.body);
    expect(received?.shadows.level2).toEqual(lightTheme.shadows.level2);
    expect(received?.maxFontSizeMultiplier).toBe(lightTheme.maxFontSizeMultiplier);
  });
});

describe('useTheme outside the provider', () => {
  it('throws a named error instead of returning a default theme', () => {
    let received: Theme | undefined;
    const Probe = makeProbe(theme => {
      received = theme;
    });

    // React logs a render error to the console before rethrowing it; the throw is the assertion.
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    try {
      expect(() => {
        act(() => {
          create(<Probe />);
        });
      }).toThrow(ThemeProviderMissingError);
    } finally {
      consoleError.mockRestore();
    }

    expect(received).toBeUndefined();
  });

  it('names the error so a crash report says what is missing', () => {
    const error = new ThemeProviderMissingError();

    expect(error.name).toBe('ThemeProviderMissingError');
    expect(error.message).toContain('ThemeProvider');
    expect(error).toBeInstanceOf(Error);
  });
});
