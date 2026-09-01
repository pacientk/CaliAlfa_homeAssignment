import { signOut, useSessionPhoneNumber } from '@features/auth';
import { strings } from '@lib/strings';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { lightTheme, ThemeProvider } from '@ui/tokens';
import type { ReactNode } from 'react';
import type * as SafeAreaContext from 'react-native-safe-area-context';

import { SettingsScreen } from '../SettingsScreen';

/**
 * The auth feature is mocked at its barrel rather than driven through the session store: what
 * this screen owes the spec is that it reads the number from the feature and hands the
 * sign-out back to it, and a double at that seam is what can prove both. The store's own
 * behaviour is covered by `sessionStore.test.ts`.
 */
jest.mock('@features/auth', () => ({
  signOut: jest.fn(),
  useSessionPhoneNumber: jest.fn(),
}));

/** See the note in `MainTabs.test.tsx` — the native safe-area view never lays out here. */
jest.mock('react-native-safe-area-context', () => {
  const actual = jest.requireActual<typeof SafeAreaContext>('react-native-safe-area-context');
  const insets = { top: 59, right: 0, bottom: 34, left: 0 };
  const frame = { x: 0, y: 0, width: 402, height: 874 };

  return {
    ...actual,
    SafeAreaProvider: ({ children }: { children: ReactNode }) => children,
    useSafeAreaInsets: () => insets,
    useSafeAreaFrame: () => frame,
  };
});

const SESSION_PHONE = '+972528287009';

const mockedSignOut = jest.mocked(signOut);
const mockedPhoneNumber = jest.mocked(useSessionPhoneNumber);

/**
 * Rendered without a navigation container on purpose: a screen that needed one to sign out
 * would not render here at all, which is the cheapest available proof that this one leaves
 * the routing to the root navigator's session switch.
 */
const renderScreen = async (): Promise<void> => {
  await render(<SettingsScreen />, { wrapper: ThemeProvider });
};

beforeEach(() => {
  jest.clearAllMocks();
  mockedPhoneNumber.mockReturnValue(SESSION_PHONE);
});

describe('the settings tab (C2)', () => {
  it('shows the number the session reports, above the device line', async () => {
    await renderScreen();

    expect(screen.getByTestId('settings.phoneNumber')).toHaveTextContent(SESSION_PHONE);
    expect(screen.getByText(strings.settings.account.device)).toBeTruthy();
  });

  it('says the number is unavailable when the session carries none', async () => {
    mockedPhoneNumber.mockReturnValue(undefined);

    await renderScreen();

    expect(screen.getByTestId('settings.phoneNumber')).toHaveTextContent(
      strings.settings.account.unknownPhone,
    );
    expect(screen.queryByText(SESSION_PHONE)).toBeNull();
  });

  it('draws the account card with the brand avatar the design specifies', async () => {
    await renderScreen();

    expect(screen.getByTestId('settings.avatar')).toHaveStyle({
      backgroundColor: lightTheme.colors.primary.fixed,
      borderRadius: lightTheme.borderRadius.full,
      width: lightTheme.sizes.size52,
      height: lightTheme.sizes.size52,
    });
    expect(screen.getByTestId('settings.account')).toHaveStyle({
      backgroundColor: lightTheme.colors.surface.lowest,
      borderRadius: lightTheme.borderRadius.radius20,
    });
  });

  it('ends the session when the log-out row is pressed', async () => {
    await renderScreen();

    await fireEvent.press(screen.getByRole('button', { name: strings.settings.signOut }));

    expect(mockedSignOut).toHaveBeenCalledTimes(1);
  });

  it('does not end the session merely by being looked at', async () => {
    await renderScreen();

    expect(mockedSignOut).not.toHaveBeenCalled();
  });

  it('draws the log-out row in the error colour, as the only pressable on the screen', async () => {
    await renderScreen();

    expect(screen.getByTestId('settings.signOut')).toHaveStyle({
      backgroundColor: lightTheme.colors.surface.lowest,
      borderRadius: lightTheme.borderRadius.radius16,
    });
    expect(screen.getByText(strings.settings.signOut)).toHaveStyle({
      color: lightTheme.colors.text.error,
      fontWeight: lightTheme.typography.bodyStrong.fontWeight,
    });
    expect(screen.queryAllByRole('button')).toHaveLength(1);
  });

  it('warns that signing back in needs another SMS code', async () => {
    await renderScreen();

    expect(screen.getByText(strings.settings.signOutNote)).toBeTruthy();
  });
});

describe('the preferences card', () => {
  it('lists the three rows the design draws, dimmed so none looks tappable', async () => {
    await renderScreen();

    expect(screen.getByText(strings.settings.preferences.heading)).toBeTruthy();

    for (const testID of ['settings.notifications', 'settings.appearance', 'settings.about']) {
      // 60% is what artboard C2 annotates as "nothing looks tappable that isn't".
      expect(screen.getByTestId(testID)).toHaveStyle({ opacity: 0.6 });
    }
  });

  it('tags the row that is not built and shows a value on the rows that are stated', async () => {
    await renderScreen();

    expect(screen.getByTestId('settings.notifications.tag')).toHaveStyle({
      backgroundColor: lightTheme.colors.surface.containerHigh,
      borderRadius: lightTheme.borderRadius.full,
    });
    expect(screen.getByText(strings.settings.preferences.soon)).toBeTruthy();

    // Appearance and About state a value instead, so neither carries the tag.
    expect(screen.queryByTestId('settings.appearance.tag')).toBeNull();
    expect(screen.queryByTestId('settings.about.tag')).toBeNull();
    expect(screen.getByText(strings.settings.preferences.appearanceValue)).toBeTruthy();
    expect(screen.getByText(strings.settings.preferences.aboutValue)).toBeTruthy();
  });

  it('rules off every row but the first, inset to where the labels start', async () => {
    await renderScreen();

    expect(screen.getByTestId('settings.notifications.body')).not.toHaveStyle({
      borderTopColor: lightTheme.colors.surface.container,
    });
    expect(screen.getByTestId('settings.appearance.body')).toHaveStyle({
      borderTopWidth: 1,
      borderTopColor: lightTheme.colors.surface.container,
    });
    expect(screen.getByTestId('settings.about.body')).toHaveStyle({
      borderTopWidth: 1,
      borderTopColor: lightTheme.colors.surface.container,
    });
  });
});
