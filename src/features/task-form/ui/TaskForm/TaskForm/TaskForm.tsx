import { useTaskForm } from '@features/task-form/hooks/useTaskForm';
import { titleErrorMessage } from '@features/task-form/lib/titleErrorMessage';
import { emptyTaskFormValues, taskFormValuesOf } from '@features/task-form/model/TaskFormValues';
import { strings } from '@lib/strings';
import { AppScrollView, AppTextInput, AppView } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryField } from '../CategoryField';
import { CompletionCard } from '../CompletionCard';
import { DeleteTaskAction } from '../DeleteTaskAction';
import { ExpiryField } from '../ExpiryField';
import { FieldLabel } from '../FieldLabel';
import { FormTipCard } from '../FormTipCard';
import { PrimaryFormButton } from '../PrimaryFormButton';
import { TaskFormHeader } from '../TaskFormHeader';
import { TaskMetadata } from '../TaskMetadata';
import type { ITaskFormProps } from './ITaskForm';
import { makeTaskFormStyles } from './TaskForm.styles';

/**
 * Artboards B6, B7 and B8 — the create form, its title error, and the edit form.
 *
 * One component rather than two screens' worth of look-alikes: the fields, the rhythm, the
 * validation and the pickers are identical, and the differences all arrive as props. See
 * `ITaskForm.ts` for what those are and why `editedTask` carries most of them.
 */
export const TaskForm = ({
  screenTitle,
  submitLabel,
  editedTask,
  existingTitles,
  categorySuggestions,
  onSubmit,
  onBack,
  onDelete,
}: ITaskFormProps): JSX.Element => {
  const styles = useThemedStyles(makeTaskFormStyles);
  const insets = useSafeAreaInsets();

  const form = useTaskForm({
    initialValues: editedTask === undefined ? emptyTaskFormValues() : taskFormValuesOf(editedTask),
    existingTitles,
    ...(editedTask === undefined ? {} : { editingTaskTitle: editedTask.title }),
  });

  const submit = (): void => {
    onSubmit(form.values);
  };

  return (
    <AppView style={[styles.screen, { paddingTop: insets.top }]}>
      <TaskFormHeader title={screenTitle} onBack={onBack} testID="taskForm.back" />

      <AppScrollView
        shouldAvoidKeyboard
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom }]}
        testID="taskForm.content"
      >
        {editedTask === undefined ? null : (
          <CompletionCard
            isDone={form.values.isDone}
            onToggle={form.setIsDone}
            testID="taskForm.completion"
          />
        )}

        <AppView>
          <FieldLabel text={strings.taskForm.title.label} />
          <AppTextInput
            value={form.values.title}
            onChangeText={form.setTitle}
            accessibilityLabel={strings.taskForm.title.label}
            errorMessage={titleErrorMessage(form.visibleTitleRejection, form.values.title)}
            testID="taskForm.title"
          />
        </AppView>

        <AppView>
          <FieldLabel text={strings.taskForm.description.label} isOptional />
          <AppTextInput
            value={form.values.description}
            onChangeText={form.setDescription}
            accessibilityLabel={strings.taskForm.description.label}
            placeholder={strings.taskForm.description.placeholder}
            isMultiline
            testID="taskForm.description"
          />
        </AppView>

        <CategoryField
          value={form.values.category}
          onChange={form.setCategory}
          suggestions={categorySuggestions}
          testID="taskForm.category"
        />

        <AppView style={styles.metadata}>
          <ExpiryField
            value={form.values.expiresAt}
            onChange={form.setExpiresAt}
            testID="taskForm.expiry"
          />
          {editedTask === undefined ? null : (
            <TaskMetadata
              createdAt={editedTask.createdAt}
              expiresAt={form.values.expiresAt}
              testID="taskForm.metadata"
            />
          )}
        </AppView>

        {editedTask === undefined ? <FormTipCard /> : null}

        <AppView style={styles.spacer} />

        <AppView>
          <PrimaryFormButton
            label={submitLabel}
            onPress={submit}
            isDisabled={!form.canSubmit}
            testID="taskForm.submit"
          />
          {onDelete === undefined ? null : (
            <DeleteTaskAction onPress={onDelete} testID="taskForm.delete" />
          )}
        </AppView>
      </AppScrollView>
    </AppView>
  );
};
