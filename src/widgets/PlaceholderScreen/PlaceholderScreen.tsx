import { AppPressable, AppText, AppView } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';

import type { IPlaceholderScreenProps } from './IPlaceholderScreen';
import { makePlaceholderScreenStyles } from './PlaceholderScreen.styles';

const NO_ACTIONS: readonly [] = [];

/**
 * A screen that exists so the navigation graph can be walked before any screen has content.
 *
 * It is temporary by design: T-008 through T-012 each replace one of its callers with the
 * real screen, and the last of them deletes this widget. It is a widget rather than eight
 * copies of the same JSX because the same block appears at eight call sites today —
 * `docs/architecture/principles.md § DRY` calls three a rule.
 */
export const PlaceholderScreen = ({
  title,
  subtitle,
  actions = NO_ACTIONS,
}: IPlaceholderScreenProps): JSX.Element => {
  const styles = useThemedStyles(makePlaceholderScreenStyles);

  return (
    <AppView style={styles.screen}>
      <AppText variant="title" accessibilityRole="header" style={styles.text}>
        {title}
      </AppText>

      {subtitle === undefined ? null : (
        <AppText variant="bodySmall" color="secondary" style={styles.text}>
          {subtitle}
        </AppText>
      )}

      {actions.map(action => (
        <AppPressable
          key={action.label}
          onPress={action.onPress}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          style={styles.action}
        >
          <AppText variant="label" color="onPrimary">
            {action.label}
          </AppText>
        </AppPressable>
      ))}
    </AppView>
  );
};
