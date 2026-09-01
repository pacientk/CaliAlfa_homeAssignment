import { strings } from '@lib/strings';
import { AppText } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';

import { makeFieldLabelStyles } from './FieldLabel.styles';
import type { IFieldLabelProps } from './IFieldLabel';

/**
 * A form field's caption.
 *
 * The optional marker is a nested run inside the same text rather than a second element on
 * a row: the canvas draws it inline, and a nested `AppText` inherits the line box, so the
 * two stay on one baseline when the OS text size grows and wrap together when it grows far.
 *
 * It is not `AppTextInput`'s own `label` prop for the same reason — that prop takes a
 * string, and this caption is two differently-styled runs.
 */
export const FieldLabel = ({ text, isOptional = false }: IFieldLabelProps): JSX.Element => {
  const styles = useThemedStyles(makeFieldLabelStyles);

  return (
    <AppText variant="label" color="secondary" style={styles.label}>
      {text}
      {isOptional ? (
        <AppText variant="bodySmall" color="tertiary">
          {strings.taskForm.optional}
        </AppText>
      ) : null}
    </AppText>
  );
};
