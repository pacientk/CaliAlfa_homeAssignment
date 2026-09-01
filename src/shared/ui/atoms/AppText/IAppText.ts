import type { TextColors, TypographyVariants } from '@ui/tokens';
import type { ReactNode } from 'react';
import type { StyleProp, TextStyle } from 'react-native';

/** A named text style from the theme. The canvas draws these fifteen pairings and no others. */
export type TextVariant = keyof TypographyVariants;

/** A semantic text colour role. Components pick a role; they never pick a shade. */
export type TextColorRole = keyof TextColors;

export interface IAppTextProps {
  readonly children: ReactNode;
  /** Defaults to `body` — 16/24 regular, the design's default copy. */
  readonly variant?: TextVariant;
  /** Defaults to `primary`. */
  readonly color?: TextColorRole;
  /** Truncates with an ellipsis past this many lines. Omitted means no limit. */
  readonly numberOfLines?: number;
  /**
   * For per-instance layout — alignment, a strike-through, a flex rule. It cannot override
   * the font-scale cap, which is applied after it.
   */
  readonly style?: StyleProp<TextStyle>;
  /** Set on text that is structurally a heading or an announcement rather than prose. */
  readonly accessibilityRole?: 'header' | 'alert' | 'text';
  readonly accessibilityLabel?: string;
  readonly testID?: string;
}
