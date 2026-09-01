import { strings } from '@lib/strings';
import { AppIcon, AppPressable, AppScrollView, AppText, AppView } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CalendarPreview } from './CalendarPreview';
import { makeCalendarScreenStyles } from './CalendarScreen.styles';
import type { ICalendarScreenProps } from './ICalendarScreen';

/**
 * Artboard C1 — the calendar tab, which is a coming-soon state and stays one.
 *
 * It is deliberately not an `EmptyState`. That widget is the answer to "your data is empty":
 * a tile, a headline, a line of copy and a button that fills the emptiness. This screen is the
 * answer to "this feature is not built yet", and the design says so with different furniture —
 * an eyebrow badge, a preview of what is coming, and no call to action, because there is
 * nothing here for the user to do. Bending one into the other would cost both of them the
 * thing that makes them legible.
 *
 * The screen scrolls even though the canvas fits in one frame: the copy is real prose and the
 * theme lets the OS text size reach 130%, at which point it no longer fits.
 */
export const CalendarScreen = ({ onBackToTasks }: ICalendarScreenProps): JSX.Element => {
  const styles = useThemedStyles(makeCalendarScreenStyles);
  const insets = useSafeAreaInsets();

  return (
    <AppView style={[styles.screen, { paddingTop: insets.top }]}>
      <AppView style={styles.header}>
        <AppText
          variant="title"
          color="accent"
          accessibilityRole="header"
          style={styles.headerTitle}
        >
          {strings.calendar.title}
        </AppText>
      </AppView>

      <AppScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <AppView style={styles.badge} testID="calendar.badge">
          <AppIcon name="schedule" size="size18" color="accent" />
          <AppText variant="overline" color="accent">
            {strings.calendar.badge}
          </AppText>
        </AppView>

        <CalendarPreview style={styles.preview} />

        <AppText variant="title" accessibilityRole="header" style={styles.heading}>
          {strings.calendar.heading}
        </AppText>

        <AppText variant="body" color="secondary" style={styles.body}>
          {strings.calendar.subtitle}
        </AppText>

        <AppPressable
          onPress={onBackToTasks}
          accessibilityRole="button"
          accessibilityLabel={strings.calendar.backToTasks}
          style={styles.backAction}
        >
          <AppText variant="bodyStrong" color="accent">
            {strings.calendar.backToTasks}
          </AppText>
        </AppPressable>
      </AppScrollView>
    </AppView>
  );
};
