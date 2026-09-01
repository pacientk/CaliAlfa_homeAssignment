import { AppIcon, AppPressable, AppText, AppView } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';

import type { ITabBarItemProps } from './ITabBarItem';
import { makeTabBarItemStyles } from './TabBarItem.styles';

/**
 * One of the three tabs. Every difference between the active and resting states is a named
 * variant chosen by `isFocused` — the fill behind the glyph, the glyph's colour, and the
 * label's weight and colour — which is the second of the three style categories in
 * `docs/architecture/coding-rules.md § No inline styles`.
 *
 * The pressable is announced as a `tab` carrying `selected`, so a screen reader reports which
 * one is current; the icon itself stays unannounced, because the label already says it.
 */
export const TabBarItem = ({
  icon,
  label,
  isFocused,
  onPress,
  testID,
}: ITabBarItemProps): JSX.Element => {
  const styles = useThemedStyles(makeTabBarItemStyles);

  return (
    <AppPressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: isFocused }}
      style={styles.item}
    >
      <AppView
        style={[styles.pill, isFocused ? styles.pillActive : styles.pillResting]}
        testID={testID}
      >
        <AppIcon name={icon} size="size22" color={isFocused ? 'onPrimary' : 'secondary'} />
      </AppView>

      <AppText
        variant={isFocused ? 'captionStrong' : 'captionMedium'}
        color={isFocused ? 'accent' : 'secondary'}
      >
        {label}
      </AppText>
    </AppPressable>
  );
};
