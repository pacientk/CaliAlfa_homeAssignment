/** The native safe-area view never lays out under Jest; the sheet reads the bottom inset. */
jest.mock('react-native-safe-area-context', () => {
  const actual = jest.requireActual<typeof SafeAreaContext>('react-native-safe-area-context');

  return { ...actual, useSafeAreaInsets: () => ({ top: 59, right: 0, bottom: 34, left: 0 }) };
});

import { fireEvent, render, screen } from '@testing-library/react-native';
import type { BottomSheetVariant } from '@ui/atoms';
import { AppBottomSheet, AppText } from '@ui/atoms';
import { lightTheme, ThemeProvider } from '@ui/tokens';
import type * as SafeAreaContext from 'react-native-safe-area-context';

/**
 * The sheet's two safety switches are the whole reason it takes props instead of being two
 * components, so they are what these tests are about. Each is asserted in both directions:
 * a picker can be waved away, a destructive question cannot.
 */
const renderSheet = async (props: {
  readonly onRequestClose: () => void;
  readonly variant?: BottomSheetVariant;
}): Promise<void> => {
  await render(
    <AppBottomSheet
      isVisible
      onRequestClose={props.onRequestClose}
      title="Country code"
      closeLabel="Close"
      accessibilityLabel="Country code"
      testID="sheet"
      {...(props.variant === undefined ? {} : { variant: props.variant })}
    >
      <AppText>Body</AppText>
    </AppBottomSheet>,
    { wrapper: ThemeProvider },
  );
};

describe('the bottom sheet', () => {
  it('draws its title, its close button and the body it is given', async () => {
    await renderSheet({ onRequestClose: jest.fn() });

    expect(screen.getByText('Country code')).toBeTruthy();
    expect(screen.getByTestId('sheet.close')).toBeTruthy();
    expect(screen.getByText('Body')).toBeTruthy();
  });

  it('closes from the scrim and from the close button, by default', async () => {
    const onRequestClose = jest.fn();
    await renderSheet({ onRequestClose });

    await fireEvent.press(screen.getByTestId('sheet.scrim'));
    await fireEvent.press(screen.getByTestId('sheet.close'));

    expect(onRequestClose).toHaveBeenCalledTimes(2);
  });

  it('offers neither exit when it is asking a destructive question', async () => {
    const onRequestClose = jest.fn();
    await renderSheet({ onRequestClose, variant: 'confirmation' });

    expect(screen.queryByTestId('sheet.close')).toBeNull();

    await fireEvent.press(screen.getByTestId('sheet.scrim'));

    expect(onRequestClose).not.toHaveBeenCalled();
  });

  it('gives a destructive question the display face', async () => {
    await renderSheet({ onRequestClose: jest.fn(), variant: 'confirmation' });

    expect(screen.getByRole('header', { name: 'Country code' })).toHaveStyle({
      fontSize: lightTheme.typography.title.fontSize,
    });
  });

  it('keeps a picker heading quiet — the paired half of the rule above', async () => {
    // A picker's header is a caption for a list. Giving it the same weight as a destructive
    // question would flatten the only difference between the two shapes.
    await renderSheet({ onRequestClose: jest.fn() });

    expect(screen.getByRole('header', { name: 'Country code' })).toHaveStyle({
      fontSize: lightTheme.typography.label.fontSize,
    });
  });

  it('does not close on its own', async () => {
    const onRequestClose = jest.fn();
    await renderSheet({ onRequestClose });

    expect(onRequestClose).not.toHaveBeenCalled();
  });
});
