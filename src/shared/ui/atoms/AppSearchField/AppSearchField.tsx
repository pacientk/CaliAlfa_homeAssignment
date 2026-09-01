import { useTheme, useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';
import { useState } from 'react';
import { TextInput } from 'react-native';

import { AppIcon } from '../AppIcon';
import { AppPressable } from '../AppPressable';
import { AppView } from '../AppView';
import { makeAppSearchFieldStyles } from './AppSearchField.styles';
import type { IAppSearchFieldProps } from './IAppSearchField';

/**
 * The design's search field: a leading glyph, the query, and a circular clear button that
 * appears once there is something to clear.
 *
 * The brand ring is driven by "focused **or** filled" rather than by focus alone, because
 * artboard B5 draws the ring on a field the user has typed into and then left — the field is
 * the reason the list is short, so it stays visually live while it holds a query.
 */
export const AppSearchField = ({
  value,
  onChangeText,
  onClear,
  accessibilityLabel,
  clearAccessibilityLabel,
  placeholder,
  style,
  testID,
}: IAppSearchFieldProps): JSX.Element => {
  const styles = useThemedStyles(makeAppSearchFieldStyles);
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const hasQuery = value.length > 0;
  const isActive = isFocused || hasQuery;

  return (
    <AppView
      style={[styles.field, isActive ? styles.fieldActive : styles.fieldResting, style]}
      testID={testID === undefined ? undefined : `${testID}.box`}
    >
      <AppIcon name="search" size="size20" color={isActive ? 'accent' : 'tertiary'} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.text.tertiary}
        selectionColor={theme.colors.primary.base}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        maxFontSizeMultiplier={theme.maxFontSizeMultiplier}
        accessibilityLabel={accessibilityLabel}
        style={styles.input}
        testID={testID}
      />
      {hasQuery ? (
        <AppPressable
          onPress={onClear}
          accessibilityRole="button"
          accessibilityLabel={clearAccessibilityLabel}
          style={styles.clear}
          testID={testID === undefined ? undefined : `${testID}.clear`}
        >
          <AppIcon name="close" size="size16" color="secondary" />
        </AppPressable>
      ) : null}
    </AppView>
  );
};
