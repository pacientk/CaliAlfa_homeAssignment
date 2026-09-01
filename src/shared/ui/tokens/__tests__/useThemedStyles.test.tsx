import type { JSX } from 'react';
import { StyleSheet } from 'react-native';
import { act, create } from 'react-test-renderer';

import { ThemeProvider } from '../ThemeProvider';
import { lightTheme } from '../themes/light';
import type { Theme } from '../themes/types';
import { ThemeProviderMissingError } from '../useTheme';
import { useThemedStyles } from '../useThemedStyles';

const makeCardStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface.lowest,
      borderRadius: theme.borderRadius.radius16,
      padding: theme.spacing.space14,
    },
  });

type CardStyles = ReturnType<typeof makeCardStyles>;

describe('useThemedStyles inside the provider', () => {
  it('invokes the factory with the current theme and returns its stylesheet', () => {
    const factory = jest.fn(makeCardStyles);
    let styles: CardStyles | undefined;

    function Probe(): JSX.Element | null {
      styles = useThemedStyles(factory);

      return null;
    }

    act(() => {
      create(
        <ThemeProvider>
          <Probe />
        </ThemeProvider>,
      );
    });

    expect(factory).toHaveBeenCalledTimes(1);
    expect(factory).toHaveBeenCalledWith(lightTheme);
    expect(styles?.card).toEqual({
      backgroundColor: lightTheme.colors.surface.lowest,
      borderRadius: lightTheme.borderRadius.radius16,
      padding: lightTheme.spacing.space14,
    });
  });
});

describe('useThemedStyles outside the provider', () => {
  it('throws and never runs the factory, so no unthemed stylesheet is produced', () => {
    const factory = jest.fn(makeCardStyles);

    function Probe(): JSX.Element | null {
      useThemedStyles(factory);

      return null;
    }

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

    expect(factory).not.toHaveBeenCalled();
  });
});
