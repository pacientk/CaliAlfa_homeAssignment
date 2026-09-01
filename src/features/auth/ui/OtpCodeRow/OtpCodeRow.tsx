import { AppText, AppTextInput, AppView } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';
import type { ViewStyle } from 'react-native';

import type { IOtpCodeRowProps } from './IOtpCodeRow';
import type { OtpCodeRowStyles } from './OtpCodeRow.styles';
import { makeOtpCodeRowStyles } from './OtpCodeRow.styles';

/** Six digits, as FR-1 and every artboard from A3 to A5 draw them. */
export const OTP_CODE_LENGTH = 6;

const LAST_BOX_INDEX = OTP_CODE_LENGTH - 1;
const BOX_POSITIONS: readonly number[] = Array.from({ length: OTP_CODE_LENGTH }, (_, at) => at);
const NON_DIGITS = /\D/g;

/**
 * Precedence, not a chain of conditionals in the JSX: a row in error is in error whether or
 * not the caret happens to be sitting in one of its boxes, which is what artboard A5 draws —
 * six red boxes and no ring.
 */
const resolveBoxStyle = (
  styles: OtpCodeRowStyles,
  position: number,
  caretPosition: number,
  hasError: boolean,
): ViewStyle => {
  if (hasError) {
    return styles.boxError;
  }

  return position === caretPosition ? styles.boxFocused : styles.boxResting;
};

/**
 * The six-box code field.
 *
 * The ring marks the box the next digit lands in, so it advances as digits are typed and
 * retreats as they are deleted — artboard A3 draws it on the first box when the code is
 * empty, A4 on the sixth when the code is full. It is derived from the length of the value
 * rather than tracked as state of its own, which is what makes the two impossible to
 * disagree.
 */
export const OtpCodeRow = ({
  code,
  onCodeChange,
  hasError,
  accessibilityLabel,
  testID,
}: IOtpCodeRowProps): JSX.Element => {
  const styles = useThemedStyles(makeOtpCodeRowStyles);
  const caretPosition = Math.min(code.length, LAST_BOX_INDEX);

  // Everything that is not a digit is dropped rather than rejected, so a pasted "123-456"
  // fills the row instead of doing nothing.
  const changeCode = (next: string): void => {
    onCodeChange(next.replace(NON_DIGITS, '').slice(0, OTP_CODE_LENGTH));
  };

  return (
    <AppView style={styles.row}>
      {BOX_POSITIONS.map(position => (
        <AppView
          key={`otp-box-${position}`}
          style={[styles.box, resolveBoxStyle(styles, position, caretPosition, hasError)]}
          testID={`otp.box.${position}`}
        >
          <AppText
            variant="title"
            color={hasError ? 'onErrorContainer' : 'primary'}
            style={styles.digit}
          >
            {code[position] ?? ''}
          </AppText>
        </AppView>
      ))}

      <AppTextInput
        value={code}
        onChangeText={changeCode}
        accessibilityLabel={accessibilityLabel}
        keyboardType="number-pad"
        maxLength={OTP_CODE_LENGTH}
        style={styles.field}
        testID={testID}
      />
    </AppView>
  );
};
