import { AppProviders } from '@app/AppProviders';
import { signIn, signOut } from '@features/auth';
import { strings } from '@lib/strings';
import { act, render, screen, userEvent } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import type * as SafeAreaContext from 'react-native-safe-area-context';

import { RootNavigator } from '../RootNavigator';

/**
 * `SafeAreaProvider` measures a native view, which never lays out under the test renderer, so
 * without this the tab bar's children would never mount. The mock is a per-file factory rather
 * than a root `__mocks__/` entry so it cannot silently change another task's suite.
 */
jest.mock('react-native-safe-area-context', () => {
  const actual = jest.requireActual<typeof SafeAreaContext>('react-native-safe-area-context');
  const insets = { top: 0, right: 0, bottom: 0, left: 0 };
  const frame = { x: 0, y: 0, width: 402, height: 874 };

  return {
    ...actual,
    SafeAreaProvider: ({ children }: { children: ReactNode }) => children,
    useSafeAreaInsets: () => insets,
    useSafeAreaFrame: () => frame,
  };
});

const renderApp = async (): Promise<void> => {
  await render(
    <AppProviders>
      <RootNavigator />
    </AppProviders>,
  );
};

describe('RootNavigator', () => {
  afterEach(async () => {
    await act(() => {
      signOut();
    });
  });

  it('renders the auth stack and no tab shell when there is no session', async () => {
    await renderApp();

    expect(screen.getByText(strings.welcome.title)).toBeTruthy();
    expect(screen.queryByText(strings.tabs.calendar)).toBeNull();
    expect(screen.queryByText(strings.taskList.title)).toBeNull();
  });

  it('renders the tab shell and no auth screen once a session exists', async () => {
    await act(() => {
      signIn();
    });

    await renderApp();

    expect(screen.getByText(strings.taskList.title)).toBeTruthy();
    expect(screen.getByText(strings.tabs.calendar)).toBeTruthy();
    expect(screen.getByText(strings.tabs.settings)).toBeTruthy();
    expect(screen.queryByText(strings.welcome.title)).toBeNull();
  });

  it('swaps the auth stack for the tab shell when the session is created while mounted', async () => {
    await renderApp();

    await userEvent.press(screen.getByRole('button', { name: strings.welcome.continue }));
    await userEvent.press(screen.getByRole('button', { name: strings.phoneNumber.submit }));
    await userEvent.press(screen.getByRole('button', { name: strings.verificationCode.submit }));

    expect(screen.getByText(strings.taskList.title)).toBeTruthy();
    expect(screen.queryByText(strings.verificationCode.subtitle)).toBeNull();
  });
});
