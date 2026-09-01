import { AppIcon, AppText, AppView } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';

import type { IPreferenceRowProps } from './IPreferenceRow';
import { makePreferenceRowStyles } from './PreferenceRow.styles';

/**
 * One row of artboard C2's preferences card.
 *
 * It is an `AppView` and not an `AppPressable` on purpose. None of the three preferences the
 * design draws is built — notifications, appearance and the about entry are all out of scope
 * for this spec — so a row that responded to a tap would be a lie the accessibility tree told
 * as well as the eye. Nothing here is interactive, so nothing here carries a role or a label.
 */
export const PreferenceRow = ({
  icon,
  label,
  value,
  hasTag,
  hasDivider,
  testID,
}: IPreferenceRowProps): JSX.Element => {
  const styles = useThemedStyles(makePreferenceRowStyles);

  return (
    <AppView style={styles.row} testID={testID}>
      <AppIcon name={icon} size="size20" color="secondary" />

      <AppView
        style={[styles.body, hasDivider ? styles.bodyDivided : undefined]}
        testID={testID === undefined ? undefined : `${testID}.body`}
      >
        <AppText variant="body" style={styles.label}>
          {label}
        </AppText>

        {hasTag ? (
          <AppView style={styles.tag} testID={testID === undefined ? undefined : `${testID}.tag`}>
            <AppText variant="captionMedium" color="tertiary">
              {value}
            </AppText>
          </AppView>
        ) : (
          <AppText variant="bodySmall" color="tertiary">
            {value}
          </AppText>
        )}
      </AppView>
    </AppView>
  );
};
