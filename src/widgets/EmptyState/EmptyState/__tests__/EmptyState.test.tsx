import { fireEvent, render, screen } from '@testing-library/react-native';
import { lightTheme, ThemeProvider } from '@ui/tokens';

import { EmptyState } from '../EmptyState';
import type { EmptyStateTone } from '../IEmptyState';

const TEST_ID = 'empty';

const renderState = async (tone: EmptyStateTone, isCentred: boolean): Promise<jest.Mock> => {
  const onAction = jest.fn<void, []>();

  await render(
    <EmptyState
      icon={tone === 'brand' ? 'checklist' : 'search_off'}
      tone={tone}
      title="A title"
      message="A message"
      actionLabel="Do the thing"
      onAction={onAction}
      actionIcon={tone === 'brand' ? 'add' : undefined}
      isCentred={isCentred}
      testID={TEST_ID}
    />,
    { wrapper: ThemeProvider },
  );

  return onAction;
};

describe('EmptyState', () => {
  it('draws the brand tone with a filled button and centres it in the space left (B4)', async () => {
    await renderState('brand', true);

    expect(screen.getByTestId(TEST_ID)).toHaveStyle({
      justifyContent: 'center',
      paddingBottom: lightTheme.spacing.space120,
    });
    expect(screen.getByTestId(`${TEST_ID}.action`)).toHaveStyle({
      backgroundColor: lightTheme.colors.primary.base,
    });
    expect(screen.getByText('add')).toBeTruthy();
  });

  it('draws the neutral tone as an outline button anchored below the header (B5)', async () => {
    await renderState('neutral', false);

    expect(screen.getByTestId(TEST_ID)).toHaveStyle({
      justifyContent: 'flex-start',
      paddingTop: lightTheme.spacing.space56,
    });
    expect(screen.getByTestId(`${TEST_ID}.action`)).toHaveStyle({
      backgroundColor: lightTheme.colors.surface.screen,
      borderColor: lightTheme.colors.primary.base,
    });
    expect(screen.getByTestId(`${TEST_ID}.action`)).not.toHaveStyle({
      backgroundColor: lightTheme.colors.primary.base,
    });
    // The neutral action carries no leading glyph — B5 draws the label alone.
    expect(screen.queryByText('add')).toBeNull();
  });

  it('reports its action once, when the button is pressed', async () => {
    const onAction = await renderState('brand', true);

    expect(onAction).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByTestId(`${TEST_ID}.action`));

    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
