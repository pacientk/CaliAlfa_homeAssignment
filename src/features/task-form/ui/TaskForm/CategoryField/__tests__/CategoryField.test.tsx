import { CATEGORY_MAX_LENGTH } from '@entities/task';
import { propOf } from '@features/auth/testing/renderedElement';
import { CategoryField } from '@features/task-form';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '@ui/tokens';

const renderField = async (
  suggestions: readonly string[] = ['Admin', 'Work'],
  value = '',
): Promise<jest.Mock<void, [string]>> => {
  const onChange = jest.fn<void, [string]>();

  await render(
    <CategoryField value={value} onChange={onChange} suggestions={suggestions} testID="category" />,
    { wrapper: ThemeProvider },
  );

  return onChange;
};

describe('the category field', () => {
  it('caps a typed name at the length a chip can hold', async () => {
    await renderField();

    await fireEvent.press(screen.getByTestId('category.new'));

    expect(propOf<number | undefined>(screen.getByTestId('category.input'), 'maxLength')).toBe(
      CATEGORY_MAX_LENGTH,
    );
  });

  it('still offers a longer category the server already holds', async () => {
    // The limit constrains what this app creates. Truncating what is already stored would be
    // corrupting data to satisfy a UI rule, so a long seeded name stays selectable.
    const stored = 'Administrator';
    expect(stored.length).toBeGreaterThan(CATEGORY_MAX_LENGTH);

    const onChange = await renderField([stored]);

    await fireEvent.press(screen.getByTestId(`category.chip.${stored}`));

    expect(onChange).toHaveBeenCalledWith(stored);
  });
});
