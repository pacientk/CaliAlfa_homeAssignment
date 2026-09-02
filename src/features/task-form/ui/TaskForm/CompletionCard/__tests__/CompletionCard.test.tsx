import { CompletionCard } from '@features/task-form';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { lightTheme, ThemeProvider } from '@ui/tokens';

/** The Material Symbols ligature the checkbox used to draw when a task was complete. */
const CHECK_GLYPH = 'check';

const renderCard = async (isDone: boolean, onToggle = jest.fn()): Promise<jest.Mock> => {
  await render(<CompletionCard isDone={isDone} onToggle={onToggle} testID="completion" />, {
    wrapper: ThemeProvider,
  });

  return onToggle;
};

describe('the completion row on the edit screen', () => {
  it('draws completion once, in the switch, with no tick beside it', async () => {
    // The row used to carry a checkbox next to the switch: two pictures of one boolean, which
    // reads as two controls a reader has to reconcile.
    //
    // The assertion is the glyph rather than a checkbox role, and that is not a detail. A
    // role query passes over a plain view that merely names a role — the first version of
    // this test did, and the mutation that restored the checkbox went straight through it.
    // The tick is the thing the eye actually sees, so it is the thing worth asserting.
    await renderCard(true);

    expect(screen.getAllByRole('switch')).toHaveLength(1);
    expect(screen.queryByText(CHECK_GLYPH)).toBeNull();
  });

  it('shows a completed task in the switch alone', async () => {
    await renderCard(true);

    expect(screen.getByTestId('completion')).toHaveStyle({
      backgroundColor: lightTheme.colors.primary.base,
    });
  });

  it('shows an unfinished one the same way — the paired half of the rule above', async () => {
    await renderCard(false);

    expect(screen.getByTestId('completion')).toHaveStyle({
      backgroundColor: lightTheme.colors.surface.containerHighest,
    });
  });

  it('reports the state it moved to, not a request to flip', async () => {
    const onToggle = await renderCard(false);

    await fireEvent.press(screen.getByRole('switch'));

    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('answers to the switch and not to the label beside it', async () => {
    // The whole row used to be the control: a settings label that looked like text and
    // answered to touch, with a button's press-scale under it. Only the switch responds now.
    const onToggle = await renderCard(false);

    await fireEvent.press(screen.getByText('Mark as completed'));

    expect(onToggle).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByRole('switch'));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('does not report anything on its own', async () => {
    const onToggle = await renderCard(false);

    expect(onToggle).not.toHaveBeenCalled();
  });
});
