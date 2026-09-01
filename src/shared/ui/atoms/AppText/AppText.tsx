import { useTheme, useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';
import { Text } from 'react-native';

import { makeAppTextStyles } from './AppText.styles';
import type { IAppTextProps } from './IAppText';

/**
 * Every string the user reads goes through here.
 *
 * The reason it is a primitive rather than a convenience is `maxFontSizeMultiplier`: the cap
 * on the OS text-size setting is a single theme value, and it is applied here so that no
 * screen can forget it and no screen can re-derive it. The cap is deliberately not a prop —
 * a caller that could raise it would be re-deriving it.
 */
export const AppText = ({
  children,
  variant = 'body',
  color = 'primary',
  numberOfLines,
  style,
  accessibilityRole,
  accessibilityLabel,
  testID,
}: IAppTextProps): JSX.Element => {
  const styles = useThemedStyles(makeAppTextStyles);
  const theme = useTheme();

  return (
    <Text
      style={[styles.variant[variant], styles.color[color], style]}
      maxFontSizeMultiplier={theme.maxFontSizeMultiplier}
      numberOfLines={numberOfLines}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      {children}
    </Text>
  );
};
