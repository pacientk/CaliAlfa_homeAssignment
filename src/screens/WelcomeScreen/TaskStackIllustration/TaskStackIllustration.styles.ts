import type { Theme } from '@ui/tokens';
import type { ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

/** The three card widths the canvas draws, as a proportion of the panel's inner width. */
export type IllustrationCardWidth = 'wide' | 'medium' | 'narrow';

export interface TaskStackIllustrationStyles {
  readonly panel: ViewStyle;
  readonly card: ViewStyle;
  readonly cardWidth: Record<IllustrationCardWidth, ViewStyle>;
  readonly checkboxDone: ViewStyle;
  readonly checkboxOpen: ViewStyle;
  readonly bar: ViewStyle;
  readonly barDone: ViewStyle;
  readonly barOpen: ViewStyle;
}

/** Sheet D draws every checkbox with a 2 pt edge; a border width is structural, not rhythm. */
const CHECKBOX_BORDER_WIDTH = 2;

/**
 * The card widths are the canvas's own percentages. They are component-scoped constants
 * rather than theme tokens because `docs/architecture/principles.md § Sizing` reserves that
 * for values genuinely unique to one component — these three describe the ragged edge of one
 * decorative stack, and there is no second place in the app they could mean anything.
 */
const CARD_WIDTHS: Record<IllustrationCardWidth, ViewStyle> = {
  wide: { width: '100%' },
  medium: { width: '88%' },
  narrow: { width: '76%' },
};

/**
 * Artboard A1's hero: three rounded cards on the low surface, two ticked and one open.
 *
 * The canvas fixes the panel at 172 pt and lets its own flex layout compress the cards into
 * it. Here the panel is sized by its contents instead, so the block grows with the OS text
 * size rather than clipping — `docs/architecture/principles.md § Sizing`. Every padding, gap,
 * radius and colour below is the canvas's; only the outer height is derived.
 */
export const makeTaskStackIllustrationStyles = (theme: Theme): TaskStackIllustrationStyles => ({
  ...StyleSheet.create({
    panel: {
      justifyContent: 'center',
      gap: theme.spacing.space10,
      padding: theme.spacing.space20,
      borderRadius: theme.borderRadius.radius24,
      backgroundColor: theme.colors.surface.low,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.space12,
      paddingVertical: theme.spacing.space12,
      paddingHorizontal: theme.spacing.space14,
      borderRadius: theme.borderRadius.radius14,
      backgroundColor: theme.colors.surface.lowest,
      ...theme.shadows.level1,
    },
    checkboxDone: {
      width: theme.sizes.size20,
      height: theme.sizes.size20,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.borderRadius.radius8,
      backgroundColor: theme.colors.feedback.success,
    },
    checkboxOpen: {
      width: theme.sizes.size20,
      height: theme.sizes.size20,
      borderRadius: theme.borderRadius.radius8,
      borderWidth: CHECKBOX_BORDER_WIDTH,
      borderColor: theme.colors.border.base,
    },
    bar: {
      flex: 1,
      height: theme.sizes.size8,
      borderRadius: theme.borderRadius.full,
    },
    barDone: { backgroundColor: theme.colors.surface.containerHighest },
    barOpen: { backgroundColor: theme.colors.surface.containerHigh },
  }),
  cardWidth: StyleSheet.create(CARD_WIDTHS),
});
