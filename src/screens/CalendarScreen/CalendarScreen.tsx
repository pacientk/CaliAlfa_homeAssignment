import { strings } from '@lib/strings';
import { PlaceholderScreen } from '@widgets/PlaceholderScreen';
import type { JSX } from 'react';

/** Placeholder for artboard C1. T-012 replaces the body. */
export const CalendarScreen = (): JSX.Element => (
  <PlaceholderScreen title={strings.calendar.title} subtitle={strings.calendar.subtitle} />
);
