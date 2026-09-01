import { fireEvent, render, screen } from '@testing-library/react-native';
import { lightTheme, ThemeProvider } from '@ui/tokens';

import { AppSearchField } from '../AppSearchField';

const LABEL = 'Search tasks';
const CLEAR_LABEL = 'Clear search';
const TEST_ID = 'search';

interface FieldHandlers {
  onChangeText: jest.Mock<void, [string]>;
  onClear: jest.Mock<void, []>;
}

const renderField = async (value: string): Promise<FieldHandlers> => {
  const handlers: FieldHandlers = {
    onChangeText: jest.fn<void, [string]>(),
    onClear: jest.fn<void, []>(),
  };

  await render(
    <AppSearchField
      value={value}
      onChangeText={handlers.onChangeText}
      onClear={handlers.onClear}
      accessibilityLabel={LABEL}
      clearAccessibilityLabel={CLEAR_LABEL}
      placeholder="Search tasks…"
      testID={TEST_ID}
    />,
    { wrapper: ThemeProvider },
  );

  return handlers;
};

/** The field's box is the input's parent — the only element carrying the border. */
const fieldBox = (): ReturnType<typeof screen.getByTestId> => screen.getByTestId(`${TEST_ID}.box`);

describe('AppSearchField', () => {
  it('rests under a hairline and shows no clear button while it is empty', async () => {
    await renderField('');

    expect(fieldBox()).toHaveStyle({
      borderWidth: 1,
      borderColor: lightTheme.colors.border.subtle,
      minHeight: lightTheme.sizes.size48,
      borderRadius: lightTheme.borderRadius.radius16,
    });
    expect(screen.queryByLabelText(CLEAR_LABEL)).toBeNull();
  });

  it('wears the 2 pt brand ring and offers a clear button once it holds a query', async () => {
    await renderField('passport');

    expect(fieldBox()).toHaveStyle({
      borderWidth: 2,
      borderColor: lightTheme.colors.border.focus,
    });
    expect(screen.getByLabelText(CLEAR_LABEL)).toBeTruthy();
  });

  it('reports what was typed', async () => {
    const handlers = await renderField('');

    await fireEvent.changeText(screen.getByLabelText(LABEL), 'Fix');

    expect(handlers.onChangeText).toHaveBeenCalledWith('Fix');
  });

  it('asks the caller to clear rather than clearing itself — the value stays controlled', async () => {
    const handlers = await renderField('passport');

    await fireEvent.press(screen.getByLabelText(CLEAR_LABEL));

    expect(handlers.onClear).toHaveBeenCalledTimes(1);
    expect(handlers.onChangeText).not.toHaveBeenCalled();
    // Nothing re-rendered on its own: the field still shows what the caller gave it.
    expect(screen.getByLabelText(LABEL)).toHaveProp('value', 'passport');
  });
});
