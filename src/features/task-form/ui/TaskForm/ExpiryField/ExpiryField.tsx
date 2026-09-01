import { formatTimestamp } from '@features/task-form/lib/formatTimestamp';
import { strings } from '@lib/strings';
import { AppIcon, AppPressable, AppText, AppView } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';
import { useState } from 'react';

import { ExpiryPicker } from '../ExpiryPicker';
import { FieldLabel } from '../FieldLabel';
import { makeExpiryFieldStyles } from './ExpiryField.styles';
import type { IExpiryFieldProps } from './IExpiryField';

/**
 * When the task expires — or, by default, never.
 *
 * "Never" is a first-class value here, not the absence of one: `TaskDraft.expiresAt` is
 * required precisely because omitting it makes the API invent a deadline about a year out,
 * which would quietly turn every deadline-free task into one that eventually renders as
 * expired. So the field always has a value, `null` is one of them, and the clear button is
 * the way back to it after a mistaken tap.
 */
export const ExpiryField = ({ value, onChange, testID }: IExpiryFieldProps): JSX.Element => {
  const styles = useThemedStyles(makeExpiryFieldStyles);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const hasExpiry = value !== null;

  const closePicker = (): void => {
    setIsPickerOpen(false);
  };

  const applyExpiry = (next: string | null): void => {
    closePicker();
    onChange(next);
  };

  return (
    <AppView testID={testID}>
      <FieldLabel text={strings.taskForm.expiry.label} isOptional />

      <AppView style={styles.field}>
        <AppPressable
          onPress={() => {
            setIsPickerOpen(true);
          }}
          accessibilityRole="button"
          accessibilityLabel={strings.taskForm.expiry.open}
          style={styles.open}
          testID={`${testID}.open`}
        >
          <AppIcon name="event" size="size20" color={hasExpiry ? 'secondary' : 'tertiary'} />
          <AppText
            variant="body"
            color={hasExpiry ? 'primary' : 'tertiary'}
            numberOfLines={1}
            style={styles.value}
            testID={`${testID}.value`}
          >
            {hasExpiry ? formatTimestamp(value) : strings.taskForm.expiry.empty}
          </AppText>
          {hasExpiry ? null : <AppIcon name="expand_more" size="size20" color="tertiary" />}
        </AppPressable>

        {hasExpiry ? (
          <AppPressable
            onPress={() => {
              onChange(null);
            }}
            accessibilityRole="button"
            accessibilityLabel={strings.taskForm.expiry.clear}
            testID={`${testID}.clear`}
          >
            <AppIcon name="close" size="size18" color="tertiary" />
          </AppPressable>
        ) : null}
      </AppView>

      {isPickerOpen ? (
        <ExpiryPicker
          value={value}
          onCancel={closePicker}
          onConfirm={applyExpiry}
          testID={`${testID}.picker`}
        />
      ) : null}
    </AppView>
  );
};
