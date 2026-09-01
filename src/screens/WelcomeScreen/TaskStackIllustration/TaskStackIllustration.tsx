import { strings } from '@lib/strings';
import { AppIcon, AppView } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';

import type { IllustrationCardWidth } from './TaskStackIllustration.styles';
import { makeTaskStackIllustrationStyles } from './TaskStackIllustration.styles';

interface IllustrationCard {
  readonly width: IllustrationCardWidth;
  readonly isDone: boolean;
}

/** Top to bottom, as artboard A1 stacks them: two completed, one still open. */
const CARDS: readonly IllustrationCard[] = [
  { width: 'medium', isDone: true },
  { width: 'wide', isDone: true },
  { width: 'narrow', isDone: false },
];

/**
 * The welcome hero.
 *
 * The design brief replaces a 3D render with a geometric task stack "built from rounded
 * rectangles and icons", so this is drawn from themed views rather than shipped as an asset —
 * which also means it re-themes with everything else and costs no image bytes.
 *
 * It carries one accessibility label for the whole block and nothing inside it is announced:
 * the stack says the same thing the headline above it already says.
 */
export const TaskStackIllustration = (): JSX.Element => {
  const styles = useThemedStyles(makeTaskStackIllustrationStyles);

  return (
    <AppView style={styles.panel} accessibilityLabel={strings.welcome.illustrationLabel}>
      {CARDS.map(card => (
        <AppView key={card.width} style={[styles.card, styles.cardWidth[card.width]]}>
          <AppView style={card.isDone ? styles.checkboxDone : styles.checkboxOpen}>
            {card.isDone ? <AppIcon name="check" size="size16" color="onPrimary" /> : null}
          </AppView>
          <AppView style={[styles.bar, card.isDone ? styles.barDone : styles.barOpen]} />
        </AppView>
      ))}
    </AppView>
  );
};
