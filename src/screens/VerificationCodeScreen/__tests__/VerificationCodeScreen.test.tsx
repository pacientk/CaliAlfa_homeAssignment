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

import type { ConfirmationHandle } from '@features/auth';
import { AuthError, AuthServiceContext } from '@features/auth';
import { clearVerification, setVerification } from '@features/auth/model/verificationStore';
import type { FakeAuthService } from '@features/auth/testing/authServiceDouble';
import { createFakeAuthService } from '@features/auth/testing/authServiceDouble';
import { isDisabled, propOf, styleOf } from '@features/auth/testing/renderedElement';
import { strings } from '@lib/strings';
import { act, fireEvent, render, screen, within } from '@testing-library/react-native';
import { lightTheme, ThemeProvider } from '@ui/tokens';
import type { ReactNode } from 'react';
import type * as SafeAreaContext from 'react-native-safe-area-context';

import { VerificationCodeScreen } from '../VerificationCodeScreen';

const TEST_PHONE = '+972528287009';
const TEST_CODE = '123456';
const COUNTDOWN_SECONDS = 60;
const ONE_SECOND_MS = 1_000;

const HANDLE: ConfirmationHandle = {
  verificationId: 'verification-id-test',
  confirm: (): Promise<void> => Promise.resolve(),
};

const boxAt = (position: number): ReturnType<typeof screen.getByTestId> =>
  screen.getByTestId(`otp.box.${position}`);

const renderVerificationCode = async (
  service: FakeAuthService = createFakeAuthService(),
): Promise<jest.Mock<void, []>> => {
  const onBack = jest.fn<void, []>();

  await render(
    <AuthServiceContext.Provider value={service}>
      <ThemeProvider>
        <VerificationCodeScreen onBack={onBack} />
      </ThemeProvider>
    </AuthServiceContext.Provider>,
  );

  return onBack;
};

/** RNTL v14's `fireEvent` is async: without the `await`, the state it causes is not committed. */
const enterCode = async (value: string): Promise<void> => {
  await fireEvent.changeText(screen.getByTestId('otp.field'), value);
};

const pressNext = async (): Promise<void> => {
  await fireEvent.press(screen.getByTestId('otp.next'));
  await act(async () => {
    await Promise.resolve();
  });
};

/** A service whose confirmation always refuses, for the error state artboard A5 draws. */
const refusingService = (): FakeAuthService => ({
  ...createFakeAuthService(),
  confirmCode: () => Promise.reject(new AuthError({ kind: 'invalidCode' })),
});

beforeEach(() => {
  setVerification(TEST_PHONE, HANDLE);
});

afterEach(() => {
  clearVerification();
});

describe('the verification screen — AC-2', () => {
  it('names the number the code went to', async () => {
    await renderVerificationCode();

    expect(screen.getByText(strings.verificationCode.sentTo(TEST_PHONE))).toBeTruthy();
  });

  it('disables the call to action while the code is empty', async () => {
    await renderVerificationCode();

    const next = screen.getByTestId('otp.next');

    expect(isDisabled(next)).toBe(true);
    expect(styleOf(next).backgroundColor).toBe(lightTheme.colors.surface.containerHighest);
  });

  it('leaves it disabled at five digits', async () => {
    await renderVerificationCode();

    await enterCode('12345');

    expect(isDisabled(screen.getByTestId('otp.next'))).toBe(true);
  });

  it('enables it on the sixth digit', async () => {
    await renderVerificationCode();

    await enterCode(TEST_CODE);

    const next = screen.getByTestId('otp.next');

    expect(isDisabled(next)).toBe(false);
    expect(styleOf(next).backgroundColor).toBe(lightTheme.colors.primary.base);
  });

  it('submits nothing while fewer than six digits are entered', async () => {
    const service = createFakeAuthService();
    await renderVerificationCode(service);
    await enterCode('12345');

    await pressNext();

    expect(service.submittedCodes).toEqual([]);
  });

  it('submits the six digits once they are all there', async () => {
    const service = createFakeAuthService();
    await renderVerificationCode(service);
    await enterCode(TEST_CODE);

    await pressNext();

    expect(service.submittedCodes).toEqual([TEST_CODE]);
  });
});

describe('the verification screen — the code row', () => {
  it('rings the first box while the code is empty, as artboard A3 draws it', async () => {
    await renderVerificationCode();

    expect(styleOf(boxAt(0)).borderColor).toBe(lightTheme.colors.border.focus);
    expect(styleOf(boxAt(0)).borderWidth).toBe(2);
    expect(styleOf(boxAt(1)).borderColor).toBe(lightTheme.colors.border.base);
    expect(styleOf(boxAt(1)).borderWidth).toBe(1);
  });

  it('moves the ring forward as digits are entered', async () => {
    await renderVerificationCode();

    await enterCode('123');

    expect(styleOf(boxAt(3)).borderColor).toBe(lightTheme.colors.border.focus);
    expect(styleOf(boxAt(2)).borderColor).toBe(lightTheme.colors.border.base);
  });

  it('moves the ring back when a digit is deleted', async () => {
    await renderVerificationCode();
    await enterCode('123');

    await enterCode('12');

    expect(styleOf(boxAt(2)).borderColor).toBe(lightTheme.colors.border.focus);
    expect(styleOf(boxAt(3)).borderColor).toBe(lightTheme.colors.border.base);
  });

  it('rings the last box when the code is full, as artboard A4 draws it', async () => {
    await renderVerificationCode();

    await enterCode(TEST_CODE);

    expect(styleOf(boxAt(5)).borderColor).toBe(lightTheme.colors.border.focus);
    expect(styleOf(boxAt(4)).borderColor).toBe(lightTheme.colors.border.base);
  });

  it('distributes a pasted code across the boxes', async () => {
    await renderVerificationCode();

    await enterCode(TEST_CODE);

    expect(within(boxAt(0)).getByText('1')).toBeTruthy();
    expect(within(boxAt(5)).getByText('6')).toBeTruthy();
  });

  it('drops everything that is not a digit from a pasted value', async () => {
    await renderVerificationCode();

    await enterCode('12-34 56');

    expect(propOf<string>(screen.getByTestId('otp.field'), 'value')).toBe(TEST_CODE);
  });

  it('ignores anything typed past the sixth digit', async () => {
    await renderVerificationCode();

    await enterCode('1234567890');

    expect(propOf<string>(screen.getByTestId('otp.field'), 'value')).toBe(TEST_CODE);
  });
});

describe('the verification screen — AC-3', () => {
  it('reddens the row, explains itself, and keeps the digits when the code is refused', async () => {
    await renderVerificationCode(refusingService());
    await enterCode(TEST_CODE);

    await pressNext();

    expect(styleOf(boxAt(0)).backgroundColor).toBe(lightTheme.colors.feedback.errorContainer);
    expect(styleOf(boxAt(0)).borderColor).toBe(lightTheme.colors.border.error);
    expect(screen.getByText(strings.authFailure.invalidCode)).toBeTruthy();
    expect(propOf<string>(screen.getByTestId('otp.field'), 'value')).toBe(TEST_CODE);
    expect(within(boxAt(0)).getByText('1')).toBeTruthy();
  });

  it('leaves the row in its resting palette and says nothing when the code is accepted', async () => {
    await renderVerificationCode();
    await enterCode(TEST_CODE);

    await pressNext();

    expect(styleOf(boxAt(0)).backgroundColor).toBe(lightTheme.colors.surface.lowest);
    expect(screen.queryByTestId('otp.message')).toBeNull();
  });

  it('drops the error state as soon as the digits are corrected', async () => {
    await renderVerificationCode(refusingService());
    await enterCode(TEST_CODE);
    await pressNext();

    await enterCode('12345');

    expect(styleOf(boxAt(0)).backgroundColor).toBe(lightTheme.colors.surface.lowest);
    expect(screen.queryByTestId('otp.message')).toBeNull();
  });
});

describe('the verification screen — AC-4', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const advanceSeconds = async (seconds: number): Promise<void> => {
    for (let tick = 0; tick < seconds; tick += 1) {
      await act(async () => {
        jest.advanceTimersByTime(ONE_SECOND_MS);
        await Promise.resolve();
      });
    }
  };

  it('counts down and offers no resend while the minute runs', async () => {
    await renderVerificationCode();

    expect(screen.getByText(strings.verificationCode.resendIn('1:00'))).toBeTruthy();
    expect(screen.queryByTestId('otp.resend')).toBeNull();
  });

  it('still offers no resend one second before the wait is over', async () => {
    await renderVerificationCode();

    await advanceSeconds(COUNTDOWN_SECONDS - 1);

    expect(screen.getByText(strings.verificationCode.resendIn('0:01'))).toBeTruthy();
    expect(screen.queryByTestId('otp.resend')).toBeNull();
  });

  it('offers resend once the countdown reaches zero', async () => {
    await renderVerificationCode();

    await advanceSeconds(COUNTDOWN_SECONDS);

    expect(screen.getByTestId('otp.resend')).toBeTruthy();
    expect(screen.queryByText(strings.verificationCode.resendIn('0:00'))).toBeNull();
  });

  it('asks for a new code and re-arms the wait when resend is pressed', async () => {
    const service = createFakeAuthService();
    await renderVerificationCode(service);
    await advanceSeconds(COUNTDOWN_SECONDS);

    await fireEvent.press(screen.getByTestId('otp.resend'));
    await act(async () => {
      await Promise.resolve();
    });

    expect(service.requestedPhones).toEqual([TEST_PHONE]);
    expect(screen.getByText(strings.verificationCode.resendIn('1:00'))).toBeTruthy();
    expect(screen.queryByTestId('otp.resend')).toBeNull();
  });
});
