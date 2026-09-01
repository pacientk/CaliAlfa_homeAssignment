import { lightTheme } from '@ui/tokens';
import type { TextStyle } from 'react-native';
import { StyleSheet, Text } from 'react-native';
import type { ReactTestInstance } from 'react-test-renderer';

import { firstOf, readProp, renderWithTheme } from '../../testing/renderWithTheme';
import { AppText } from '../AppText';
import type { IAppTextProps } from '../IAppText';

const renderText = (props: Partial<IAppTextProps> = {}): ReactTestInstance => {
  const renderer = renderWithTheme(<AppText {...props}>Fix Elle Driver</AppText>);

  return firstOf(renderer.root.findAllByType(Text), 'Text');
};

const styleOf = (host: ReactTestInstance): TextStyle =>
  StyleSheet.flatten(readProp<TextStyle>(host, 'style'));

describe('AppText typography', () => {
  it('applies the requested variant from the theme', () => {
    const style = styleOf(renderText({ variant: 'title' }));

    expect(style.fontSize).toBe(lightTheme.typography.title.fontSize);
    expect(style.lineHeight).toBe(lightTheme.typography.title.lineHeight);
    expect(style.fontFamily).toBe(lightTheme.typography.title.fontFamily);
    expect(style.letterSpacing).toBe(lightTheme.typography.title.letterSpacing);
  });

  it('falls back to body, not to the last variant asked for', () => {
    const style = styleOf(renderText());

    expect(style.fontSize).toBe(lightTheme.typography.body.fontSize);
    expect(style.fontSize).not.toBe(lightTheme.typography.title.fontSize);
  });

  it('never composes a text style from loose values — every variant is a theme pairing', () => {
    const style = styleOf(renderText({ variant: 'caption' }));

    expect(style).toMatchObject({ ...lightTheme.typography.caption });
  });
});

describe('AppText colour', () => {
  it('applies the requested semantic role', () => {
    expect(styleOf(renderText({ color: 'accent' })).color).toBe(lightTheme.colors.text.accent);
    expect(styleOf(renderText({ color: 'error' })).color).toBe(lightTheme.colors.text.error);
  });

  it('defaults to the primary text role rather than to no colour at all', () => {
    const style = styleOf(renderText());

    expect(style.color).toBe(lightTheme.colors.text.primary);
    expect(style.color).not.toBe(lightTheme.colors.text.accent);
  });
});

describe('AppText font-scale cap (AC-3)', () => {
  it('caps the OS multiplier at the theme value', () => {
    const multiplier = readProp<number>(renderText(), 'maxFontSizeMultiplier');

    expect(multiplier).toBe(lightTheme.maxFontSizeMultiplier);
    expect(multiplier).toBeLessThanOrEqual(lightTheme.maxFontSizeMultiplier);
  });

  it('is a cap the atom adds — a raw Text has none', () => {
    // The negative half: without the atom the multiplier is simply absent, which is what
    // "every raw <Text> is a place where the cap silently does not happen" means in practice.
    const renderer = renderWithTheme(<Text>Fix Elle Driver</Text>);
    const raw = firstOf(renderer.root.findAllByType(Text), 'Text');

    expect(readProp<number | undefined>(raw, 'maxFontSizeMultiplier')).toBeUndefined();
  });

  it('cannot be raised by a caller-supplied style', () => {
    const host = renderText({ style: { fontSize: 96 } });

    expect(readProp<number>(host, 'maxFontSizeMultiplier')).toBe(lightTheme.maxFontSizeMultiplier);
  });
});

describe('AppText passthrough', () => {
  it('lets a caller style override the variant without replacing it', () => {
    const style = styleOf(renderText({ variant: 'title', style: { textAlign: 'center' } }));

    expect(style.textAlign).toBe('center');
    expect(style.fontSize).toBe(lightTheme.typography.title.fontSize);
  });

  it('passes numberOfLines through, and leaves it unset when it was not asked for', () => {
    expect(readProp<number | undefined>(renderText({ numberOfLines: 1 }), 'numberOfLines')).toBe(1);
    expect(readProp<number | undefined>(renderText(), 'numberOfLines')).toBeUndefined();
  });

  it('renders its children', () => {
    const renderer = renderWithTheme(<AppText>Fix Elle Driver</AppText>);

    expect(JSON.stringify(renderer.toJSON())).toContain('Fix Elle Driver');
  });
});
