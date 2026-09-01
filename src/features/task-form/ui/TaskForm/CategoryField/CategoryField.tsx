import { strings } from '@lib/strings';
import { AppIcon, AppPressable, AppText, AppTextInput, AppView } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';
import { useState } from 'react';

import { FieldLabel } from '../FieldLabel';
import { FormChip } from '../FormChip';
import { makeCategoryFieldStyles } from './CategoryField.styles';
import type { ICategoryFieldProps } from './ICategoryField';

/**
 * Choose a category, or type one (FR-15).
 *
 * There is no category store and no category endpoint: the chips *are* the distinct labels
 * the loaded tasks carry, so a value typed here becomes a category the moment its task is
 * saved and is on offer to the next task by the same derivation. That is the whole feature.
 *
 * The free-text field stays open by itself whenever the value is not one of the chips, which
 * is what makes an existing task with a one-off category editable rather than silently
 * offering to replace it.
 */
export const CategoryField = ({
  value,
  onChange,
  suggestions,
  testID,
}: ICategoryFieldProps): JSX.Element => {
  const styles = useThemedStyles(makeCategoryFieldStyles);
  const [isNamingCategory, setIsNamingCategory] = useState(false);

  const isValueOnOffer = suggestions.includes(value);
  const hasInput = isNamingCategory || (value.length > 0 && !isValueOnOffer);

  const chooseCategory = (category: string): void => {
    setIsNamingCategory(false);
    // Pressing the selected chip clears it: the field is optional, and this is the only way
    // back to "no category" once one has been picked.
    onChange(category === value ? '' : category);
  };

  const startNamingCategory = (): void => {
    setIsNamingCategory(true);
    onChange('');
  };

  return (
    <AppView testID={testID}>
      <FieldLabel text={strings.taskForm.category.label} isOptional />

      <AppView style={styles.chips}>
        {suggestions.map(category => (
          <FormChip
            key={category}
            label={category}
            isSelected={category === value}
            onPress={() => {
              chooseCategory(category);
            }}
            testID={`${testID}.chip.${category}`}
          />
        ))}

        <AppPressable
          onPress={startNamingCategory}
          accessibilityRole="button"
          accessibilityLabel={strings.taskForm.category.newCategory}
          style={styles.newChip}
          testID={`${testID}.new`}
        >
          <AppIcon name="add" size="size14" color="accent" />
          <AppText variant="captionStrong" color="accent">
            {strings.taskForm.category.newCategory}
          </AppText>
        </AppPressable>
      </AppView>

      {hasInput ? (
        <AppTextInput
          value={value}
          onChangeText={onChange}
          accessibilityLabel={strings.taskForm.category.newCategoryLabel}
          style={styles.input}
          testID={`${testID}.input`}
        />
      ) : null}
    </AppView>
  );
};
