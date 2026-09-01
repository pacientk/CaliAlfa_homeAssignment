import type { Theme } from '@ui/tokens';
import type { TextStyle, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface PreferenceRowStyles {
  readonly row: ViewStyle;
  readonly body: ViewStyle;
  readonly bodyDivided: ViewStyle;
  readonly label: TextStyle;
  readonly tag: ViewStyle;
}

/** A hairline is a structural value, not vertical rhythm, so it stays raw as the text grows. */
const DIVIDER_WIDTH = 1;

/**
 * Artboard C2 annotates these rows as "shown at 60% with a 'Soon' tag so nothing looks
 * tappable that isn't". The dimming is the whole point of the row, so it is unconditional
 * rather than a prop: every preference in this build is drawn, not built.
 */
const INACTIVE_OPACITY = 0.6;

/**
 * The canvas draws the separator as a full-width rule inset 50 pt from the left of the card.
 * 50 is not a design value — it is where the label starts, which is the 16 pt card padding
 * plus the 20 pt glyph plus the 14 pt gap. So the rule is a top border on the row's *body*,
 * which begins at exactly that point and runs to the card's edge, and no component has to
 * carry a number that three other tokens already decide.
 */
export const makePreferenceRowStyles = (theme: Theme): PreferenceRowStyles =>
  StyleSheet.create({
    row: {
      opacity: INACTIVE_OPACITY,
      flexDirection: 'row',
      alignItems: 'center',
      columnGap: theme.spacing.space14,
      paddingLeft: theme.spacing.space16,
    },
    body: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      columnGap: theme.spacing.space8,
      paddingVertical: theme.spacing.space14,
      paddingRight: theme.spacing.space16,
    },
    bodyDivided: {
      borderTopWidth: DIVIDER_WIDTH,
      borderTopColor: theme.colors.surface.container,
    },
    label: {
      flex: 1,
    },
    tag: {
      paddingVertical: theme.spacing.space2,
      paddingHorizontal: theme.spacing.space8,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.surface.containerHigh,
    },
  });
