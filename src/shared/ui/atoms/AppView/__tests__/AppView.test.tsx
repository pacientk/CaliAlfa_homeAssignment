import type { ReactElement } from 'react';
import type { ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';
import type { ReactTestInstance } from 'react-test-renderer';

import { AppText } from '../../AppText';
import { firstOf, readProp, renderWithTheme } from '../../testing/renderWithTheme';
import { AppView } from '../AppView';

/** A style the atom cannot have produced on its own, so the assertion is about passthrough. */
const styles = StyleSheet.create({ filling: { flex: 1 } });

const renderView = (element: ReactElement): ReactTestInstance =>
  firstOf(renderWithTheme(element).root.findAllByType(View), 'View');

describe('AppView', () => {
  it('renders its children', () => {
    const renderer = renderWithTheme(
      <AppView>
        <AppText>Fix Elle Driver</AppText>
      </AppView>,
    );

    expect(JSON.stringify(renderer.toJSON())).toContain('Fix Elle Driver');
  });

  it('passes a style through unchanged rather than merging one of its own', () => {
    const host = renderView(<AppView style={styles.filling} />);

    expect(StyleSheet.flatten(readProp<ViewStyle>(host, 'style'))).toEqual({ flex: 1 });
  });

  it('applies no style at all when it was given none', () => {
    const host = renderView(<AppView />);

    expect(readProp<unknown>(host, 'style')).toBeUndefined();
  });

  it('forwards an accessibility role and label when the container is meaningful', () => {
    const host = renderView(<AppView accessibilityRole="header" accessibilityLabel="To-do" />);

    expect(readProp<string>(host, 'accessibilityRole')).toBe('header');
    expect(readProp<string>(host, 'accessibilityLabel')).toBe('To-do');
  });

  it('leaves the accessibility props unset when the container is decorative', () => {
    const host = renderView(<AppView />);

    expect(readProp<string | undefined>(host, 'accessibilityRole')).toBeUndefined();
    expect(readProp<string | undefined>(host, 'accessibilityLabel')).toBeUndefined();
  });
});
