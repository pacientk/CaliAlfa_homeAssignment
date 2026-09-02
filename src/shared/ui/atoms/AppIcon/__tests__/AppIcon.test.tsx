import { lightTheme } from '@ui/tokens';
import type { TextStyle } from 'react-native';
import { StyleSheet, Text } from 'react-native';
import type { ReactTestInstance } from 'react-test-renderer';

import { firstOf, readProp, renderWithTheme } from '../../testing/renderWithTheme';
import { AppIcon } from '../AppIcon';
import type { IAppIconProps } from '../IAppIcon';

const renderIcon = (props: Partial<IAppIconProps> = {}): ReactTestInstance =>
  firstOf(
    renderWithTheme(<AppIcon name={props.name ?? 'check'} {...props} />).root.findAllByType(Text),
    'Text',
  );

const styleOf = (host: ReactTestInstance): TextStyle =>
  StyleSheet.flatten(readProp<TextStyle>(host, 'style'));

describe('AppIcon glyph', () => {
  it('renders the ligature name as the text content, because the font draws it', () => {
    expect(readProp<string>(renderIcon({ name: 'more_vert' }), 'children')).toBe('more_vert');
  });

  it('sets the icon face from the theme, not the body face', () => {
    const style = styleOf(renderIcon());

    expect(style.fontFamily).toBe(lightTheme.iconFontFamily);
    expect(style.fontFamily).not.toBe(lightTheme.typography.body.fontFamily);
  });
});

describe('AppIcon size', () => {
  it('applies the requested glyph size and sets no line height at all', () => {
    // A line box the height of the em box does not centre a Material Symbols glyph on iOS —
    // it pins it to the top, because the font's ascent reaches above the em square and text
    // is laid out from the top of the line box. Leaving the line height to the font is what
    // puts the glyph in the middle of its own box, so the absence is the fix, not an
    // omission.
    const style = styleOf(renderIcon({ size: 'size28' }));

    expect(style.fontSize).toBe(lightTheme.iconSizes.size28);
    expect(style.lineHeight).toBeUndefined();
  });

  it('defaults to size20 rather than to whatever was asked for last', () => {
    const style = styleOf(renderIcon());

    expect(style.fontSize).toBe(lightTheme.iconSizes.size20);
    expect(style.fontSize).not.toBe(lightTheme.iconSizes.size28);
  });

  it('does not scale with the OS text size — a glyph is structural, not rhythm', () => {
    expect(readProp<boolean>(renderIcon(), 'allowFontScaling')).toBe(false);
  });
});

describe('AppIcon colour', () => {
  it('applies the requested semantic role', () => {
    expect(styleOf(renderIcon({ color: 'error' })).color).toBe(lightTheme.colors.text.error);
  });

  it('defaults to the primary text role', () => {
    const style = styleOf(renderIcon());

    expect(style.color).toBe(lightTheme.colors.text.primary);
    expect(style.color).not.toBe(lightTheme.colors.text.error);
  });

  it('lets a caller style win for the rare glyph whose colour is not a text role', () => {
    const style = styleOf(
      renderIcon({ color: 'primary', style: { color: lightTheme.colors.primary.container } }),
    );

    expect(style.color).toBe(lightTheme.colors.primary.container);
  });
});

describe('AppIcon accessibility', () => {
  it('is invisible to assistive technology — its label belongs to its parent', () => {
    expect(readProp<boolean>(renderIcon(), 'accessible')).toBe(false);
  });
});
