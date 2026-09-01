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

import { strings } from '@lib/strings';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '@ui/tokens';
import type { ReactNode } from 'react';
import type * as SafeAreaContext from 'react-native-safe-area-context';

import { WelcomeScreen } from '../WelcomeScreen';

const renderWelcome = async (onContinue: jest.Mock<void, []>): Promise<void> => {
  await render(
    <ThemeProvider>
      <WelcomeScreen onContinue={onContinue} />
    </ThemeProvider>,
  );
};

describe('the welcome screen', () => {
  it('draws every block artboard A1 puts on the page', async () => {
    await renderWelcome(jest.fn<void, []>());

    expect(screen.getByText(strings.welcome.badge)).toBeTruthy();
    expect(screen.getByText(strings.welcome.subtitle)).toBeTruthy();
    expect(screen.getByLabelText(strings.welcome.illustrationLabel)).toBeTruthy();
    expect(screen.getByText(strings.welcome.benefits.capture.title)).toBeTruthy();
    expect(screen.getByText(strings.welcome.benefits.momentum.title)).toBeTruthy();
    expect(screen.getByText(strings.welcome.benefits.privacy.title)).toBeTruthy();
    expect(screen.getByText(strings.welcome.logInPrompt)).toBeTruthy();
  });

  it('continues when the call to action is pressed', async () => {
    const onContinue = jest.fn<void, []>();
    await renderWelcome(onContinue);

    await fireEvent.press(screen.getByTestId('welcome.next'));

    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('sends "Log in" to the same place, because registration and sign-in are one flow', async () => {
    const onContinue = jest.fn<void, []>();
    await renderWelcome(onContinue);

    await fireEvent.press(screen.getByTestId('welcome.logIn'));

    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('does not continue on its own', async () => {
    const onContinue = jest.fn<void, []>();

    await renderWelcome(onContinue);

    expect(onContinue).not.toHaveBeenCalled();
  });
});
