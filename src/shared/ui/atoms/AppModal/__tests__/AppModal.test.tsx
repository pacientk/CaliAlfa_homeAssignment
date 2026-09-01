import { render, screen } from '@testing-library/react-native';
import { lightTheme, ThemeProvider } from '@ui/tokens';

import { AppText } from '../../AppText';
import { AppModal } from '../AppModal';

const LABEL = 'Delete task?';
const CONTENT = 'Are you sure?';

const noop = (): void => {};

const renderModal = async (isVisible: boolean): Promise<void> => {
  await render(
    <AppModal isVisible={isVisible} onRequestClose={noop} accessibilityLabel={LABEL}>
      <AppText>{CONTENT}</AppText>
    </AppModal>,
    { wrapper: ThemeProvider },
  );
};

describe('AppModal', () => {
  it('presents its content over the design scrim while it is visible', async () => {
    await renderModal(true);

    expect(screen.getByText(CONTENT)).toBeTruthy();
    expect(screen.getByLabelText(LABEL)).toHaveStyle({
      backgroundColor: lightTheme.colors.surface.scrim,
    });
  });

  it('renders nothing at all while it is not visible', async () => {
    await renderModal(false);

    expect(screen.queryByText(CONTENT)).toBeNull();
    expect(screen.queryByLabelText(LABEL)).toBeNull();
  });
});
