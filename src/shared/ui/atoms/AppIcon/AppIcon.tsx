import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';
import { Text } from 'react-native';

import { makeAppIconStyles } from './AppIcon.styles';
import type { IAppIconProps } from './IAppIcon';

/**
 * A Material Symbols Outlined glyph. The font renders a ligature, so the glyph name is the
 * text content — `check` draws a tick, not the word.
 *
 * Two deliberate choices:
 *
 * - `allowFontScaling={false}`. An icon glyph is a structural value, not vertical rhythm.
 *   `docs/architecture/principles.md § Sizing` keeps structural values raw when the OS text
 *   size grows; an icon that grew with it would burst the fixed tiles the design draws.
 * - `accessible={false}`. Every icon in this design sits beside a label or inside a labelled
 *   pressable, so announcing the ligature name would only add noise. A meaningful icon is
 *   labelled by its parent — that is what `AppPressable`'s required label is for.
 */
export const AppIcon = ({
  name,
  size = 'size20',
  color = 'primary',
  style,
  testID,
}: IAppIconProps): JSX.Element => {
  const styles = useThemedStyles(makeAppIconStyles);

  return (
    <Text
      style={[styles.face, styles.size[size], styles.color[color], style]}
      allowFontScaling={false}
      accessible={false}
      testID={testID}
    >
      {name}
    </Text>
  );
};
