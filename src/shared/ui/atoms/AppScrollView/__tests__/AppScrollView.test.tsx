import { lightTheme } from '@ui/tokens';
import type { ViewStyle } from 'react-native';
import { ScrollView, StyleSheet } from 'react-native';
import type { ReactTestInstance } from 'react-test-renderer';

import { AppText } from '../../AppText';
import { firstOf, readProp, renderWithTheme } from '../../testing/renderWithTheme';
import { AppScrollView } from '../AppScrollView';
import type { IAppScrollViewProps } from '../IAppScrollView';

const renderScrollView = (props: Partial<IAppScrollViewProps> = {}): ReactTestInstance =>
  firstOf(
    renderWithTheme(
      <AppScrollView
        hasScreenPadding={props.hasScreenPadding}
        contentContainerStyle={props.contentContainerStyle}
      >
        <AppText>Fix Elle Driver</AppText>
      </AppScrollView>,
    ).root.findAllByType(ScrollView),
    'ScrollView',
  );

const contentStyleOf = (host: ReactTestInstance): ViewStyle =>
  StyleSheet.flatten(readProp<ViewStyle>(host, 'contentContainerStyle')) ?? {};

describe('AppScrollView screen padding', () => {
  it('applies the design 20 pt horizontal screen margin when asked', () => {
    expect(contentStyleOf(renderScrollView({ hasScreenPadding: true })).paddingHorizontal).toBe(
      lightTheme.spacing.space20,
    );
  });

  it('applies none by default, so an edge-to-edge layout does not have to undo it', () => {
    expect(contentStyleOf(renderScrollView()).paddingHorizontal).toBeUndefined();
  });

  it('lets a caller content style compose on top of the screen padding', () => {
    const style = contentStyleOf(
      renderScrollView({ hasScreenPadding: true, contentContainerStyle: { paddingBottom: 34 } }),
    );

    expect(style.paddingHorizontal).toBe(lightTheme.spacing.space20);
    expect(style.paddingBottom).toBe(34);
  });
});

describe('AppScrollView keyboard behaviour', () => {
  it('keeps taps alive while the keyboard is open, so a button works on the first press', () => {
    expect(readProp<string>(renderScrollView(), 'keyboardShouldPersistTaps')).toBe('handled');
  });
});

describe('AppScrollView content', () => {
  it('renders its children', () => {
    const renderer = renderWithTheme(
      <AppScrollView>
        <AppText>Fix Elle Driver</AppText>
      </AppScrollView>,
    );

    expect(JSON.stringify(renderer.toJSON())).toContain('Fix Elle Driver');
  });
});
