import type { Theme } from '@ui/tokens';
import type { TextStyle, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface ExpiryFieldStyles {
  readonly field: ViewStyle;
  readonly open: ViewStyle;
  readonly value: TextStyle;
}

/** The resting input ring the component sheet draws, at the same 1 pt as a text field. */
const FIELD_BORDER_WIDTH = 1;

/**
 * Artboards B6 and B8: a 52 pt field with a 10 pt gap, a leading `event` glyph, the value,
 * and a trailing control — a disclosure while the field is empty, a clear once it is set.
 *
 * The clear button is a sibling of the opening press target rather than a child of it.
 * Nesting one pressable inside another gives two overlapping touch targets and two
 * accessibility nodes for what the user sees as one row; side by side, each says what it is.
 */
export const makeExpiryFieldStyles = (theme: Theme): ExpiryFieldStyles =>
  StyleSheet.create({
    field: {
      flexDirection: 'row',
      alignItems: 'center',
      columnGap: theme.spacing.space10,
      minHeight: theme.sizes.size52,
      paddingHorizontal: theme.spacing.space16,
      borderRadius: theme.borderRadius.radius12,
      backgroundColor: theme.colors.surface.lowest,
      borderWidth: FIELD_BORDER_WIDTH,
      borderColor: theme.colors.border.base,
    },
    open: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      columnGap: theme.spacing.space10,
    },
    value: {
      flex: 1,
    },
  });
