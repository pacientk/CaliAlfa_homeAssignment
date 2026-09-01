import { lightTheme } from '@ui/tokens';
import type { AccessibilityState, TextStyle } from 'react-native';
import { StyleSheet, Text, TextInput } from 'react-native';
import type { ReactTestInstance, ReactTestRenderer } from 'react-test-renderer';
import { act } from 'react-test-renderer';

import { firstOf, readHandler, readProp, renderWithTheme } from '../../testing/renderWithTheme';
import { AppTextInput } from '../AppTextInput';
import type { IAppTextInputProps } from '../IAppTextInput';

const renderInput = (props: Partial<IAppTextInputProps> = {}): ReactTestRenderer =>
  renderWithTheme(
    <AppTextInput
      value={props.value ?? 'Fix Budd'}
      onChangeText={props.onChangeText ?? jest.fn()}
      accessibilityLabel="Title"
      label={props.label}
      placeholder={props.placeholder}
      errorMessage={props.errorMessage}
      isDisabled={props.isDisabled}
      isMultiline={props.isMultiline}
    />,
  );

const fieldOf = (renderer: ReactTestRenderer): ReactTestInstance =>
  firstOf(renderer.root.findAllByType(TextInput), 'TextInput');

const styleOf = (host: ReactTestInstance): TextStyle =>
  StyleSheet.flatten(readProp<TextStyle>(host, 'style'));

const textsOf = (renderer: ReactTestRenderer): string[] =>
  renderer.root
    .findAllByType(Text)
    .map(node => JSON.stringify(readProp<unknown>(node, 'children')));

const focus = (field: ReactTestInstance): void => {
  act(() => {
    readHandler<[]>(field, 'onFocus')();
  });
};

describe('AppTextInput default state', () => {
  it('draws the resting field the component sheet specifies', () => {
    const style = styleOf(fieldOf(renderInput()));

    expect(style.minHeight).toBe(lightTheme.sizes.size52);
    expect(style.borderRadius).toBe(lightTheme.borderRadius.radius12);
    expect(style.paddingHorizontal).toBe(lightTheme.spacing.space16);
    expect(style.backgroundColor).toBe(lightTheme.colors.surface.lowest);
    expect(style.borderColor).toBe(lightTheme.colors.border.base);
  });

  it('sizes by minHeight, never by a fixed height, so enlarged text is not clipped', () => {
    const style = styleOf(fieldOf(renderInput()));

    expect(style.height).toBeUndefined();
  });

  it('caps the OS font multiplier at the theme value', () => {
    expect(readProp<number>(fieldOf(renderInput()), 'maxFontSizeMultiplier')).toBe(
      lightTheme.maxFontSizeMultiplier,
    );
  });

  it('renders the optional label only when one is given', () => {
    expect(textsOf(renderInput({ label: 'Title' })).join()).toContain('Title');
    expect(textsOf(renderInput()).join()).not.toContain('Title');
  });
});

describe('AppTextInput focus state', () => {
  it('swaps to the 2 pt primary ring once the caret is in the field', () => {
    const renderer = renderInput();
    const field = fieldOf(renderer);

    expect(styleOf(field).borderColor).toBe(lightTheme.colors.border.base);

    focus(field);

    const focused = styleOf(fieldOf(renderer));

    expect(focused.borderColor).toBe(lightTheme.colors.border.focus);
    expect(focused.borderWidth).toBe(2);
  });

  it('returns to the resting ring on blur', () => {
    const renderer = renderInput();

    focus(fieldOf(renderer));
    act(() => {
      readHandler<[]>(fieldOf(renderer), 'onBlur')();
    });

    expect(styleOf(fieldOf(renderer)).borderColor).toBe(lightTheme.colors.border.base);
  });
});

describe('AppTextInput error state (AC-4)', () => {
  const ERROR = 'A task called "Fix Budd" already exists.';

  it('borders the field with the theme error colour and tints it with the error container', () => {
    const style = styleOf(fieldOf(renderInput({ errorMessage: ERROR })));

    expect(style.borderColor).toBe(lightTheme.colors.border.error);
    expect(style.backgroundColor).toBe(lightTheme.colors.feedback.errorContainer);
  });

  it('shows the message and exposes it to accessibility', () => {
    const renderer = renderInput({ errorMessage: ERROR });
    const alerts = renderer.root
      .findAllByType(Text)
      .filter(node => readProp<string | undefined>(node, 'accessibilityRole') === 'alert');

    expect(alerts).toHaveLength(1);
    expect(readProp<string>(firstOf(alerts, 'alert'), 'accessibilityLabel')).toBe(ERROR);
    expect(textsOf(renderer).join()).toContain('already exists');
    // The field itself carries it too, for a reader that returns to the input later.
    expect(readProp<string | undefined>(fieldOf(renderer), 'accessibilityHint')).toBe(ERROR);
  });

  it('shows neither the message nor the error styling when there is no error', () => {
    const renderer = renderInput();
    const style = styleOf(fieldOf(renderer));

    expect(style.borderColor).not.toBe(lightTheme.colors.border.error);
    expect(style.backgroundColor).not.toBe(lightTheme.colors.feedback.errorContainer);
    expect(
      renderer.root
        .findAllByType(Text)
        .filter(node => readProp<string | undefined>(node, 'accessibilityRole') === 'alert'),
    ).toHaveLength(0);
    expect(readProp<string | undefined>(fieldOf(renderer), 'accessibilityHint')).toBeUndefined();
  });

  it('treats an empty message as no error, so a cleared message clears the state', () => {
    const style = styleOf(fieldOf(renderInput({ errorMessage: '' })));

    expect(style.borderColor).toBe(lightTheme.colors.border.base);
  });

  it('keeps the error ring while the field is focused', () => {
    const renderer = renderInput({ errorMessage: ERROR });

    focus(fieldOf(renderer));

    expect(styleOf(fieldOf(renderer)).borderColor).toBe(lightTheme.colors.border.error);
  });
});

describe('AppTextInput disabled state', () => {
  it('stops editing and dims the field', () => {
    const renderer = renderInput({ isDisabled: true });
    const field = fieldOf(renderer);
    const style = styleOf(field);

    expect(readProp<boolean>(field, 'editable')).toBe(false);
    expect(readProp<AccessibilityState>(field, 'accessibilityState').disabled).toBe(true);
    expect(style.backgroundColor).toBe(lightTheme.colors.surface.containerHighest);
    expect(style.borderColor).toBe(lightTheme.colors.border.dim);
    expect(style.color).toBe(lightTheme.colors.text.tertiary);
  });

  it('is editable and undimmed when it is not disabled', () => {
    const field = fieldOf(renderInput());

    expect(readProp<boolean>(field, 'editable')).toBe(true);
    expect(styleOf(field).backgroundColor).toBe(lightTheme.colors.surface.lowest);
  });

  it('outranks the error state — a disabled field shows no focus ring', () => {
    const renderer = renderInput({ isDisabled: true, errorMessage: 'Give the task a title.' });

    focus(fieldOf(renderer));

    expect(styleOf(fieldOf(renderer)).borderColor).toBe(lightTheme.colors.border.dim);
  });
});

describe('AppTextInput editing', () => {
  it('reports every change to its caller', () => {
    const onChangeText = jest.fn();
    const renderer = renderInput({ onChangeText });

    act(() => {
      readHandler<[string]>(fieldOf(renderer), 'onChangeText')('Fix Bill');
    });

    expect(onChangeText).toHaveBeenCalledWith('Fix Bill');
  });
});

describe('AppTextInput multiline mode (artboards B6 and B8)', () => {
  it('grows to the 96 pt description box and pads it the way the canvas does', () => {
    const style = styleOf(fieldOf(renderInput({ isMultiline: true })));

    expect(style.minHeight).toBe(lightTheme.sizes.size96);
    expect(style.paddingVertical).toBe(lightTheme.spacing.space14);
    expect(style.height).toBeUndefined();
  });

  it('lets the text wrap', () => {
    expect(readProp<boolean>(fieldOf(renderInput({ isMultiline: true })), 'multiline')).toBe(true);
  });

  it('stays a single-line 52 pt field by default', () => {
    const field = fieldOf(renderInput());
    const style = styleOf(field);

    expect(readProp<boolean>(field, 'multiline')).toBe(false);
    expect(style.minHeight).toBe(lightTheme.sizes.size52);
    expect(style.paddingVertical).toBeUndefined();
  });

  it('keeps every other state it has — a multiline field still shows its error ring', () => {
    const style = styleOf(
      fieldOf(renderInput({ isMultiline: true, errorMessage: 'Give the task a title.' })),
    );

    expect(style.borderColor).toBe(lightTheme.colors.border.error);
    expect(style.minHeight).toBe(lightTheme.sizes.size96);
  });
});
