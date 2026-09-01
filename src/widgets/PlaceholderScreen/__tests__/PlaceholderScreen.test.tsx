import { render, screen, userEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@ui/tokens';
import type { ReactElement } from 'react';

import { PlaceholderScreen } from '../PlaceholderScreen';

const renderWithTheme = async (element: ReactElement): Promise<void> => {
  await render(<ThemeProvider>{element}</ThemeProvider>);
};

describe('PlaceholderScreen', () => {
  it('renders the title as a heading', async () => {
    await renderWithTheme(<PlaceholderScreen title="Tasks" />);

    expect(screen.getByRole('header', { name: 'Tasks' })).toBeTruthy();
  });

  it('renders the subtitle when one is given', async () => {
    await renderWithTheme(<PlaceholderScreen title="Tasks" subtitle="Your tasks appear here." />);

    expect(screen.getByText('Your tasks appear here.')).toBeTruthy();
  });

  it('omits the subtitle when none is given', async () => {
    await renderWithTheme(<PlaceholderScreen title="Tasks" />);

    expect(screen.queryByText('Your tasks appear here.')).toBeNull();
  });

  it('renders no actions when none are given', async () => {
    await renderWithTheme(<PlaceholderScreen title="Calendar" />);

    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('labels every action and calls only the one that was pressed', async () => {
    const openForm = jest.fn();
    const openDetail = jest.fn();

    await renderWithTheme(
      <PlaceholderScreen
        title="Tasks"
        actions={[
          { label: 'New task', onPress: openForm },
          { label: 'Open a task', onPress: openDetail },
        ]}
      />,
    );

    await userEvent.press(screen.getByRole('button', { name: 'New task' }));

    expect(openForm).toHaveBeenCalledTimes(1);
    expect(openDetail).not.toHaveBeenCalled();
  });
});
