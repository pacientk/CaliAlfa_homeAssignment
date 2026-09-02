import { AppProviders } from '@app/AppProviders';
import { AuthServiceContext, signOut, startSessionObserver } from '@features/auth';
import type { FakeAuthService } from '@features/auth/testing/authServiceDouble';
import { createFakeAuthService } from '@features/auth/testing/authServiceDouble';
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

/** The default country the picker starts on, plus the national digits typed into the field. */
const TEST_NATIONAL = '500000000';
const TEST_PHONE = '+972500000000';
const TEST_CODE = '123456';

/**
 * The session is driven the way the app drives it: through the provider's listener. There is
 * no back door any more — T-007's temporary `signIn` seeded a session with nothing behind it,
 * and T-008 deleted it once the verification screen started calling `confirmCode`.
 */
const mountApp = async (service: FakeAuthService): Promise<void> => {
  startSessionObserver(service);

  await render(
    <AuthServiceContext.Provider value={service}>
      <AppProviders>
        <RootNavigator />
      </AppProviders>
    </AuthServiceContext.Provider>,
  );
};

describe('RootNavigator', () => {
  afterEach(async () => {
    await act(() => {
      signOut();
    });
  });

  it('renders neither stack while the provider has not yet reported', async () => {
    const service = createFakeAuthService();

    await mountApp(service);

    expect(screen.queryByText(strings.welcome.badge)).toBeNull();
    expect(screen.queryByText(strings.taskList.title)).toBeNull();
  });

  it('renders the auth stack and no tab shell when the provider reports no session', async () => {
    const service = createFakeAuthService();
    await mountApp(service);

    await act(() => {
      service.emitSession(undefined);
    });

    expect(screen.getByText(strings.welcome.badge)).toBeTruthy();
    expect(screen.queryByText(strings.tabs.calendar)).toBeNull();
    expect(screen.queryByText(strings.taskList.title)).toBeNull();
  });

  it('renders the tab shell and no auth screen once the provider reports a number', async () => {
    const service = createFakeAuthService();
    await mountApp(service);

    await act(() => {
      service.emitSession(TEST_PHONE);
    });

    expect(screen.getByText(strings.taskList.title)).toBeTruthy();
    expect(screen.getByText(strings.tabs.calendar)).toBeTruthy();
    expect(screen.getByText(strings.tabs.settings)).toBeTruthy();
    expect(screen.queryByText(strings.welcome.badge)).toBeNull();
  });

  it('walks welcome to phone to code, and swaps to the tab shell when the session arrives', async () => {
    const service = createFakeAuthService();
    await mountApp(service);
    await act(() => {
      service.emitSession(undefined);
    });

    await userEvent.press(screen.getByRole('button', { name: strings.welcome.continue }));
    await userEvent.type(
      screen.getByLabelText(strings.phoneNumber.fieldAccessibilityLabel),
      TEST_NATIONAL,
    );
    await userEvent.press(screen.getByRole('button', { name: strings.phoneNumber.submit }));

    expect(screen.getByText(strings.verificationCode.sentTo(TEST_PHONE))).toBeTruthy();
    expect(service.requestedPhones).toEqual([TEST_PHONE]);

    await userEvent.type(
      screen.getByLabelText(strings.verificationCode.fieldAccessibilityLabel),
      TEST_CODE,
    );
    await userEvent.press(screen.getByRole('button', { name: strings.verificationCode.submit }));

    expect(service.submittedCodes).toEqual([TEST_CODE]);

    // Firebase reports the new session through the same listener the app has been watching
    // all along; nothing in the verification screen navigates.
    await act(() => {
      service.emitSession(TEST_PHONE);
    });

    expect(screen.getByText(strings.taskList.title)).toBeTruthy();
    expect(screen.queryByText(strings.verificationCode.title)).toBeNull();
  });
});
