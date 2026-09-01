import { AppIcon, AppPressable, AppView } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';

import { makeAuthTopBarStyles } from './AuthTopBar.styles';
import type { IAuthTopBarProps } from './IAuthTopBar';

/**
 * The back bar the phone and verification screens share.
 *
 * React Navigation's own header is off for every screen in this app
 * (`navigation/constants/screenOptions.ts`), because each artboard draws its own — so this is
 * that drawing, not a styled native header.
 */
export const AuthTopBar = ({
  onBack,
  accessibilityLabel,
  testID,
}: IAuthTopBarProps): JSX.Element => {
  const styles = useThemedStyles(makeAuthTopBarStyles);

  return (
    <AppView style={styles.bar}>
      <AppPressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        testID={testID}
      >
        <AppIcon name="arrow_back" size="size24" color="primary" />
      </AppPressable>
    </AppView>
  );
};
