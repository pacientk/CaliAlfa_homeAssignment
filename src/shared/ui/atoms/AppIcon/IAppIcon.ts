import type { IconSizeScale } from '@ui/tokens';
import type { StyleProp, TextStyle } from 'react-native';

import type { TextColorRole } from '../AppText';

/**
 * The Material Symbols Outlined ligatures the design draws, and no others. The list is
 * closed on purpose, exactly as `primitive/palette.ts` is closed: a glyph that is not here is
 * a design question, not an implementation one, and a mistyped ligature renders as its own
 * name rather than failing — which is precisely the class of bug a union prevents.
 *
 * Taken from `Tech Assignment/design/Task app multi-flow design/*.dc.html`.
 */
export type IconName =
  | 'add'
  | 'arrow_back'
  | 'arrow_forward'
  | 'auto_awesome'
  | 'battery_full'
  | 'bolt'
  | 'calendar_month'
  | 'check'
  | 'check_box'
  | 'checklist'
  | 'close'
  | 'cloud_off'
  | 'delete'
  | 'edit'
  | 'error'
  | 'event'
  | 'expand_more'
  | 'info'
  | 'light_mode'
  | 'lock'
  | 'logout'
  | 'more_vert'
  | 'notifications'
  | 'person'
  | 'schedule'
  | 'search'
  | 'search_off'
  | 'settings'
  | 'shield'
  | 'signal_cellular_alt'
  | 'sms'
  | 'sms_failed'
  | 'sync'
  | 'target'
  | 'wifi';

/** A glyph size, in points. A Material Symbols glyph fills its em box, so this is a font size. */
export type IconSize = keyof IconSizeScale;

export interface IAppIconProps {
  readonly name: IconName;
  /** Defaults to `size20` — the size the canvas draws for a control-adjacent icon. */
  readonly size?: IconSize;
  /** Defaults to `primary`. */
  readonly color?: TextColorRole;
  /**
   * For the rare glyph whose colour is not a text role — the decorative brand-container
   * purple on an empty state, for instance. Supply it from the caller's own styles factory,
   * never as a literal.
   */
  readonly style?: StyleProp<TextStyle>;
  readonly testID?: string;
}
