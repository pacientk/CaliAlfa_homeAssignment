/** The native safe-area view never lays out here; see the note in `RootNavigator.test.tsx`. */
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

import { AuthError, AuthServiceContext } from '@features/auth';
import type { FakeAuthService } from '@features/auth/testing/authServiceDouble';
import { createFakeAuthService } from '@features/auth/testing/authServiceDouble';
import { isDisabled, propOf, styleOf } from '@features/auth/testing/renderedElement';
import { strings } from '@lib/strings';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { lightTheme, ThemeProvider } from '@ui/tokens';
import type { ReactNode } from 'react';
import type * as SafeAreaContext from 'react-native-safe-area-context';

import { PhoneNumberScreen } from '../PhoneNumberScreen';

const TEST_PHONE_TYPED = '+972 52-828-7009';
const TEST_PHONE_E164 = '+972528287009';

interface MountedScreen {
  readonly service: FakeAuthService;
  readonly onCodeSent: jest.Mock<void, []>;
  readonly onBack: jest.Mock<void, []>;
}

const renderPhoneNumber = async (service = createFakeAuthService()): Promise<MountedScreen> => {
  const onCodeSent = jest.fn<void, []>();
  const onBack = jest.fn<void, []>();

  await render(
    <AuthServiceContext.Provider value={service}>
      <ThemeProvider>
        <PhoneNumberScreen onBack={onBack} onCodeSent={onCodeSent} />
      </ThemeProvider>
    </AuthServiceContext.Provider>,
  );

  return { service, onCodeSent, onBack };
};

/** RNTL v14's `fireEvent` is async: without the `await`, the state it causes is not committed. */
const typeNumber = async (value: string): Promise<void> => {
  await fireEvent.changeText(screen.getByTestId('phoneNumber.field'), value);
};

/** The press starts a provider call, so the microtask queue is drained before asserting. */
const pressNext = async (): Promise<void> => {
  await fireEvent.press(screen.getByTestId('phoneNumber.next'));
  await act(async () => {
    await Promise.resolve();
  });
};

describe('the phone number screen — AC-1', () => {
  it('disables the call to action while the field is empty', async () => {
    await renderPhoneNumber();

    const next = screen.getByTestId('phoneNumber.next');

    expect(isDisabled(next)).toBe(true);
    expect(styleOf(next).backgroundColor).toBe(lightTheme.colors.surface.containerHighest);
  });

  it('leaves it disabled for a number that is too short to be one', async () => {
    await renderPhoneNumber();

    await typeNumber('+34 66');

    expect(isDisabled(screen.getByTestId('phoneNumber.next'))).toBe(true);
  });

  it('leaves it disabled for digits with no country code', async () => {
    await renderPhoneNumber();

    await typeNumber('528287009');

    expect(isDisabled(screen.getByTestId('phoneNumber.next'))).toBe(true);
  });

  it('enables it once the number is plausible', async () => {
    await renderPhoneNumber();

    await typeNumber(TEST_PHONE_TYPED);

    const next = screen.getByTestId('phoneNumber.next');

    expect(isDisabled(next)).toBe(false);
    expect(styleOf(next).backgroundColor).toBe(lightTheme.colors.primary.base);
  });
});

describe('the phone number screen — sending', () => {
  it('normalises to E.164 before asking the provider', async () => {
    const { service, onCodeSent } = await renderPhoneNumber();
    await typeNumber(TEST_PHONE_TYPED);

    await pressNext();

    expect(service.requestedPhones).toEqual([TEST_PHONE_E164]);
    expect(onCodeSent).toHaveBeenCalledTimes(1);
  });

  it('asks for nothing while the number is implausible', async () => {
    const { service, onCodeSent } = await renderPhoneNumber();
    await typeNumber('+34 66');

    await pressNext();

    expect(service.requestedPhones).toEqual([]);
    expect(onCodeSent).not.toHaveBeenCalled();
  });

  it('keeps letters out of the field', async () => {
    await renderPhoneNumber();

    await typeNumber('+34 abc 666');

    expect(propOf<string>(screen.getByTestId('phoneNumber.field'), 'value')).toBe('+34  666');
  });

  it('shows the failure in the field and does not move on when the provider refuses', async () => {
    const failing: FakeAuthService = {
      ...createFakeAuthService(),
      sendVerificationCode: () => Promise.reject(new AuthError({ kind: 'invalidPhone' })),
    };
    const { onCodeSent } = await renderPhoneNumber(failing);
    await typeNumber(TEST_PHONE_TYPED);

    await pressNext();

    expect(screen.getByText(strings.authFailure.invalidPhone)).toBeTruthy();
    expect(onCodeSent).not.toHaveBeenCalled();
  });

  it('goes back when the back control is pressed', async () => {
    const { onBack } = await renderPhoneNumber();

    await fireEvent.press(screen.getByTestId('phoneNumber.back'));

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
