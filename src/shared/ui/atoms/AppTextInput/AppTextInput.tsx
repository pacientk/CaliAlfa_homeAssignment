import { useTheme, useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';
import { useState } from 'react';
import type { TextStyle } from 'react-native';
import { TextInput } from 'react-native';

import { AppIcon } from '../AppIcon';
import { AppText } from '../AppText';
import { AppView } from '../AppView';
import type { AppTextInputStyles } from './AppTextInput.styles';
import { makeAppTextInputStyles } from './AppTextInput.styles';
import type { IAppTextInputProps } from './IAppTextInput';

/**
 * Precedence, not a chain of conditionals in the JSX: a disabled field never shows a focus
 * ring, and an invalid field is invalid whether or not the caret is in it.
 */
const resolveFieldState = (
  styles: AppTextInputStyles,
  isDisabled: boolean,
  hasError: boolean,
  isFocused: boolean,
): TextStyle => {
  if (isDisabled) {
    return styles.fieldDisabled;
  }

  if (hasError) {
    return styles.fieldError;
  }

  return isFocused ? styles.fieldFocused : styles.fieldResting;
};

/**
 * The project's text field: artboard D's four states, an optional caption, and the inline
 * message the design puts 8 pt below the field.
 *
 * The error message is announced twice on purpose and for two different readers: as an
 * `alert` on the message itself, which fires when it appears, and as a hint on the field,
 * which is what a screen-reader user hears when they navigate back to it later.
 */
export const AppTextInput = ({
  value,
  onChangeText,
  accessibilityLabel,
  label,
  placeholder,
  errorMessage,
  isDisabled = false,
  isMultiline = false,
  keyboardType,
  maxLength,
  style,
  testID,
}: IAppTextInputProps): JSX.Element => {
  const styles = useThemedStyles(makeAppTextInputStyles);
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const hasError = errorMessage !== undefined && errorMessage.length > 0;
  const fieldState = resolveFieldState(styles, isDisabled, hasError, isFocused);

  return (
    <AppView style={[styles.container, style]}>
      {label === undefined ? null : (
        <AppText variant="label" color="secondary" style={styles.label}>
          {label}
        </AppText>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        editable={!isDisabled}
        multiline={isMultiline}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.text.tertiary}
        selectionColor={theme.colors.primary.base}
        keyboardType={keyboardType}
        maxLength={maxLength}
        maxFontSizeMultiplier={theme.maxFontSizeMultiplier}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={errorMessage}
        accessibilityState={{ disabled: isDisabled }}
        style={[styles.field, isMultiline ? styles.fieldMultiline : null, fieldState]}
        testID={testID}
      />
      {hasError ? (
        <AppView style={styles.message}>
          <AppIcon name="error" size="size16" color="error" />
          <AppText
            variant="caption"
            color="onErrorContainer"
            style={styles.messageText}
            accessibilityRole="alert"
            accessibilityLabel={errorMessage}
          >
            {errorMessage}
          </AppText>
        </AppView>
      ) : null}
    </AppView>
  );
};
