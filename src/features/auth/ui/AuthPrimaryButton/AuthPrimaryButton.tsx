import { AppIcon, AppPressable, AppText } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';

import { makeAuthPrimaryButtonStyles } from './AuthPrimaryButton.styles';
import type { IAuthPrimaryButtonProps } from './IAuthPrimaryButton';

/**
 * The call to action every auth screen ends with.
 *
 * It lives in the feature rather than in `shared/ui/` because three screens share it and no
 * fourth exists — `docs/architecture/principles.md § DRY` calls three occurrences a rule, and
 * § YAGNI rules out promoting it to a shared molecule before a consumer outside the feature
 * asks for one.
 */
export const AuthPrimaryButton = ({
  label,
  onPress,
  icon,
  isDisabled = false,
  testID,
}: IAuthPrimaryButtonProps): JSX.Element => {
  const styles = useThemedStyles(makeAuthPrimaryButtonStyles);

  return (
    <AppPressable
      onPress={onPress}
      isDisabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.button, isDisabled ? styles.buttonDisabled : styles.buttonEnabled]}
      testID={testID}
    >
      <AppText variant="label" color={isDisabled ? 'tertiary' : 'onPrimary'}>
        {label}
      </AppText>
      {icon === undefined ? null : (
        <AppIcon name={icon} size="size18" color={isDisabled ? 'tertiary' : 'onPrimary'} />
      )}
    </AppPressable>
  );
};
