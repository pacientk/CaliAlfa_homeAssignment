import { AppProviders } from '@app/AppProviders';
import { strings } from '@lib/strings';
import { NavigationContainer } from '@react-navigation/native';
import { render, screen, userEvent, within } from '@testing-library/react-native';
import { lightTheme } from '@ui/tokens';
import type { ReactNode } from 'react';
import type * as SafeAreaContext from 'react-native-safe-area-context';

import { MainTabs } from '../MainTabs';

/** See the note in `RootNavigator.test.tsx` — the native safe-area view never lays out here. */
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

const TAB_PILL_TEST_IDS = {
  tasks: 'tabBar.TaskList',
  calendar: 'tabBar.Calendar',
  settings: 'tabBar.Settings',
};

const renderTabs = async (): Promise<void> => {
  await render(
    <AppProviders>
      <NavigationContainer>
        <MainTabs />
      </NavigationContainer>
    </AppProviders>,
  );
};

const tabNamed = (label: string) => screen.getByRole('tab', { name: label });

describe('the tab shell', () => {
  it('draws all three tabs from the design, in order', async () => {
    await renderTabs();

    expect(tabNamed(strings.tabs.tasks)).toBeTruthy();
    expect(tabNamed(strings.tabs.calendar)).toBeTruthy();
    expect(tabNamed(strings.tabs.settings)).toBeTruthy();
  });

  it('fills the pill behind the active tab and tints its label with the brand colour', async () => {
    await renderTabs();

    const tasks = tabNamed(strings.tabs.tasks);

    expect(within(tasks).getByTestId(TAB_PILL_TEST_IDS.tasks)).toHaveStyle({
      backgroundColor: lightTheme.colors.primary.base,
      width: lightTheme.sizes.size64,
      height: lightTheme.sizes.size32,
      borderRadius: lightTheme.borderRadius.full,
    });
    expect(within(tasks).getByText(strings.tabs.tasks)).toHaveStyle({
      color: lightTheme.colors.text.accent,
      fontSize: lightTheme.typography.captionStrong.fontSize,
      fontWeight: lightTheme.typography.captionStrong.fontWeight,
    });
  });

  it('leaves a resting tab unfilled and its label in the secondary colour', async () => {
    await renderTabs();

    const calendar = tabNamed(strings.tabs.calendar);

    expect(within(calendar).getByTestId(TAB_PILL_TEST_IDS.calendar)).toHaveStyle({
      backgroundColor: lightTheme.colors.surface.lowest,
    });
    expect(within(calendar).getByText(strings.tabs.calendar)).toHaveStyle({
      color: lightTheme.colors.text.secondary,
      fontWeight: lightTheme.typography.captionMedium.fontWeight,
    });
  });

  it('moves the fill to the tab that was pressed', async () => {
    await renderTabs();

    await userEvent.press(tabNamed(strings.tabs.calendar));

    const calendar = tabNamed(strings.tabs.calendar);
    const tasks = tabNamed(strings.tabs.tasks);

    expect(within(calendar).getByTestId(TAB_PILL_TEST_IDS.calendar)).toHaveStyle({
      backgroundColor: lightTheme.colors.primary.base,
    });
    expect(within(tasks).getByTestId(TAB_PILL_TEST_IDS.tasks)).toHaveStyle({
      backgroundColor: lightTheme.colors.surface.lowest,
    });
    expect(screen.getByText(strings.calendar.subtitle)).toBeTruthy();
  });
});
