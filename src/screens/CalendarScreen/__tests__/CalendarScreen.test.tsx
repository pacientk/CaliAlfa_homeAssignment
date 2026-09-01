import { strings } from '@lib/strings';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { lightTheme, ThemeProvider } from '@ui/tokens';
import type { ReactNode } from 'react';
import type * as SafeAreaContext from 'react-native-safe-area-context';

import { CalendarScreen } from '../CalendarScreen';

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

/**
 * Artboard C1 annotates the month grid as "drawn at 40% opacity so it reads as a preview
 * rather than a broken control". The number is written out here rather than imported from the
 * styles module, so that a change to the value has to be made twice and meant once.
 */
const PREVIEW_OPACITY = 0.4;

const renderScreen = async (onBackToTasks = jest.fn()): Promise<jest.Mock> => {
  await render(<CalendarScreen onBackToTasks={onBackToTasks} />, { wrapper: ThemeProvider });
  return onBackToTasks;
};

describe('the calendar tab (C1)', () => {
  it('names itself and says the feature is coming, in the words the design uses', async () => {
    await renderScreen();

    expect(screen.getByRole('header', { name: strings.calendar.title })).toBeTruthy();
    expect(screen.getByText(strings.calendar.badge)).toBeTruthy();
    expect(screen.getByRole('header', { name: strings.calendar.heading })).toBeTruthy();
    expect(screen.getByText(strings.calendar.subtitle)).toBeTruthy();
  });

  it('draws the badge as a filled brand pill', async () => {
    await renderScreen();

    expect(screen.getByTestId('calendar.badge')).toHaveStyle({
      backgroundColor: lightTheme.colors.primary.fixed,
      borderRadius: lightTheme.borderRadius.radius12,
      alignSelf: 'flex-start',
    });
  });

  it('dims the month grid so it reads as a preview', async () => {
    await renderScreen();

    expect(screen.getByTestId('calendar.preview')).toHaveStyle({
      opacity: PREVIEW_OPACITY,
      backgroundColor: lightTheme.colors.surface.lowest,
      borderRadius: lightTheme.borderRadius.radius20,
    });
  });

  it('marks exactly one day as today, in the brand fill', async () => {
    await renderScreen();

    const today = screen.getAllByTestId('calendar.preview.today');

    expect(today).toHaveLength(1);
    expect(today[0]).toHaveStyle({
      backgroundColor: lightTheme.colors.primary.container,
      height: lightTheme.sizes.size28,
    });
    // The idle fill is what every other cell carries; today is not one of them.
    expect(today[0]).not.toHaveStyle({ backgroundColor: lightTheme.colors.surface.container });
  });

  it('draws the weekday column letters the canvas draws', async () => {
    await renderScreen();

    for (const letter of new Set(strings.calendar.weekdays)) {
      expect(screen.getAllByText(letter).length).toBeGreaterThan(0);
    }
  });

  it('offers exactly one control — the way back — and no other', async () => {
    await renderScreen();

    // A coming-soon screen with a control that does nothing is the failure mode this pins.
    // The canvas draws one outline action and nothing else, so one is the whole budget.
    expect(screen.queryAllByRole('button')).toHaveLength(1);
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  it('returns to the list when the back action is pressed', async () => {
    const onBackToTasks = await renderScreen();

    await fireEvent.press(screen.getByRole('button', { name: strings.calendar.backToTasks }));

    expect(onBackToTasks).toHaveBeenCalledTimes(1);
  });

  it('does not return to the list on its own', async () => {
    const onBackToTasks = await renderScreen();

    expect(onBackToTasks).not.toHaveBeenCalled();
  });
});
