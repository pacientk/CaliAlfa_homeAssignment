import type { ExpirySelection } from '@features/task-form/lib/expiryChoices';
import {
  composeExpiry,
  EXPIRY_DAY_CHOICES,
  EXPIRY_TIME_CHOICES,
  matchExpirySelection,
} from '@features/task-form/lib/expiryChoices';
import { strings } from '@lib/strings';
import { AppBottomSheet, AppPressable, AppText, AppView } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';
import { useState } from 'react';

import { FieldLabel } from '../FieldLabel';
import { FormChip } from '../FormChip';
import { makeExpiryPickerStyles } from './ExpiryPicker.styles';
import type { IExpiryPickerProps } from './IExpiryPicker';

/**
 * Picks the day and the time a task expires, or takes the expiry away.
 *
 * "Now" is captured once, when the picker mounts, rather than read on each render: every
 * choice on screen is relative to the same instant, so "Today" cannot mean two different
 * days between one press and the next. The field mounts this component fresh on each open,
 * which is also what resets the selection to the stored value rather than to the last one
 * the user abandoned.
 */
export const ExpiryPicker = ({
  value,
  onCancel,
  onConfirm,
  testID,
}: IExpiryPickerProps): JSX.Element => {
  const styles = useThemedStyles(makeExpiryPickerStyles);
  const [openedAt] = useState(() => new Date());
  const [selection, setSelection] = useState<ExpirySelection>(() =>
    matchExpirySelection(value, openedAt),
  );

  const confirm = (): void => {
    const day = EXPIRY_DAY_CHOICES.find(choice => choice.key === selection.dayKey);
    const time = EXPIRY_TIME_CHOICES.find(choice => choice.key === selection.timeKey);

    if (day === undefined || time === undefined) {
      onCancel();
      return;
    }

    onConfirm(composeExpiry(openedAt, day.dayOffset, time.hour, time.minute));
  };

  return (
    <AppBottomSheet
      isVisible
      onRequestClose={onCancel}
      title={strings.taskForm.expiry.picker.title}
      closeLabel={strings.taskForm.expiry.picker.close}
      accessibilityLabel={strings.taskForm.expiry.picker.title}
      testID={testID}
    >
      <AppView style={styles.card}>
        <AppView style={styles.section}>
          <FieldLabel text={strings.taskForm.expiry.picker.day} />
          <AppView style={styles.chips}>
            {EXPIRY_DAY_CHOICES.map(day => (
              <FormChip
                key={day.key}
                label={day.label}
                isSelected={day.key === selection.dayKey}
                onPress={() => {
                  setSelection(current => ({ ...current, dayKey: day.key }));
                }}
                testID={`${testID}.day.${day.key}`}
              />
            ))}
          </AppView>
        </AppView>

        <AppView style={styles.section}>
          <FieldLabel text={strings.taskForm.expiry.picker.time} />
          <AppView style={styles.chips}>
            {EXPIRY_TIME_CHOICES.map(time => (
              <FormChip
                key={time.key}
                label={time.label}
                isSelected={time.key === selection.timeKey}
                onPress={() => {
                  setSelection(current => ({ ...current, timeKey: time.key }));
                }}
                testID={`${testID}.time.${time.key}`}
              />
            ))}
          </AppView>
        </AppView>

        <AppView style={styles.actions}>
          <AppPressable
            onPress={() => {
              onConfirm(null);
            }}
            accessibilityRole="button"
            accessibilityLabel={strings.taskForm.expiry.picker.never}
            style={[styles.button, styles.buttonNever]}
            testID={`${testID}.never`}
          >
            <AppText variant="label">{strings.taskForm.expiry.picker.never}</AppText>
          </AppPressable>

          <AppPressable
            onPress={confirm}
            accessibilityRole="button"
            accessibilityLabel={strings.taskForm.expiry.picker.confirm}
            style={[styles.button, styles.buttonConfirm]}
            testID={`${testID}.confirm`}
          >
            <AppText variant="label" color="onPrimary">
              {strings.taskForm.expiry.picker.confirm}
            </AppText>
          </AppPressable>
        </AppView>
      </AppView>
    </AppBottomSheet>
  );
};
