import { strings } from '@lib/strings';
import { AppText, AppView } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';
import type { ViewStyle } from 'react-native';

import type { CalendarPreviewStyles } from './CalendarPreview.styles';
import { makeCalendarPreviewStyles } from './CalendarPreview.styles';
import type { ICalendarPreviewProps } from './ICalendarPreview';

/** What a cell says, which on this grid is only how it is filled. */
type PreviewDay = 'idle' | 'marked' | 'today';

/**
 * The four weeks artboard C1 draws, cell for cell. It is a literal rather than a generated
 * month because the grid is decoration: it illustrates the feature that is coming, and a real
 * month would invite the reader to tap a date that does nothing.
 */
const PREVIEW_WEEKS: readonly (readonly PreviewDay[])[] = [
  ['idle', 'idle', 'idle', 'idle', 'marked', 'idle', 'idle'],
  ['idle', 'marked', 'idle', 'idle', 'idle', 'idle', 'idle'],
  ['idle', 'idle', 'today', 'idle', 'idle', 'idle', 'idle'],
  ['idle', 'idle', 'idle', 'marked', 'idle', 'idle', 'idle'],
];

const TODAY: PreviewDay = 'today';
const MARKED: PreviewDay = 'marked';

const resolveCellStyle = (styles: CalendarPreviewStyles, day: PreviewDay): ViewStyle => {
  if (day === TODAY) {
    return styles.cellToday;
  }

  if (day === MARKED) {
    return styles.cellMarked;
  }

  return styles.cellIdle;
};

/**
 * The decorative month grid on artboard C1.
 *
 * Both dimensions of the grid are fixed literals, so a cell's position in them *is* its
 * identity and the composed index key is stable — the rule against index keys in
 * `docs/architecture/coding-rules.md § Lists` is about data whose order can change, and
 * nothing here comes from data.
 */
export const CalendarPreview = ({ style }: ICalendarPreviewProps): JSX.Element => {
  const styles = useThemedStyles(makeCalendarPreviewStyles);

  return (
    <AppView style={[styles.card, style]} testID="calendar.preview">
      <AppView style={styles.weekdays}>
        {strings.calendar.weekdays.map((letter, column) => (
          <AppText
            key={`${String(column)}-${letter}`}
            variant="captionStrong"
            color="tertiary"
            style={styles.weekday}
          >
            {letter}
          </AppText>
        ))}
      </AppView>

      <AppView style={styles.weeks}>
        {PREVIEW_WEEKS.map((week, weekIndex) => (
          <AppView key={`week-${String(weekIndex)}`} style={styles.week}>
            {week.map((day, dayIndex) => (
              <AppView
                key={`day-${String(weekIndex)}-${String(dayIndex)}`}
                style={[styles.cell, resolveCellStyle(styles, day)]}
                testID={day === TODAY ? 'calendar.preview.today' : undefined}
              />
            ))}
          </AppView>
        ))}
      </AppView>
    </AppView>
  );
};
