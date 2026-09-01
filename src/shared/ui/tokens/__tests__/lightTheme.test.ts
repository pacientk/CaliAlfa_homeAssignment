import { Palette } from '../primitive/palette';
import { Radii } from '../primitive/radii';
import { Shadows } from '../primitive/shadows';
import { Spacing } from '../primitive/spacing';
import {
  FontFamily,
  FontScale,
  FontSize,
  FontWeight,
  LetterSpacing,
  LineHeight,
} from '../primitive/typography';
import { lightTheme } from '../themes/light';
import type { Theme } from '../themes/types';

type ColorGroup = Record<string, unknown>;

/** Every leaf of a two-level colour map, with the path that reached it. */
const collectColorLeaves = (groups: Record<string, ColorGroup>): [string, unknown][] => {
  const leaves: [string, unknown][] = [];

  for (const [groupName, group] of Object.entries(groups)) {
    for (const [roleName, value] of Object.entries(group)) {
      leaves.push([`${groupName}.${roleName}`, value]);
    }
  }

  return leaves;
};

const PALETTE_VALUES = new Set<unknown>(Object.values(Palette));

/** The rule under test: a role must resolve to a value declared in `palette.ts`. */
const isPaletteValue = (value: unknown): boolean => PALETTE_VALUES.has(value);

/** The rule under test: a populated role is a non-empty string. */
const isPopulated = (value: unknown): boolean => typeof value === 'string' && value.length > 0;

const TEXT_STYLE_RULES = {
  fontFamily: new Set<unknown>(Object.values(FontFamily)),
  fontSize: new Set<unknown>(Object.values(FontSize)),
  lineHeight: new Set<unknown>(Object.values(LineHeight)),
  fontWeight: new Set<unknown>(Object.values(FontWeight)),
  letterSpacing: new Set<unknown>(Object.values(LetterSpacing)),
} as const;

/** The rule under test: a text style may only use values from the primitive type scales. */
const isPrimitiveTextStyle = (style: Record<string, unknown>): boolean =>
  Object.entries(TEXT_STYLE_RULES).every(([property, allowed]) => allowed.has(style[property]));

describe('lightTheme colours', () => {
  const leaves = collectColorLeaves(lightTheme.colors as unknown as Record<string, ColorGroup>);

  it('resolves every colour role to a value declared in palette.ts', () => {
    const offenders = leaves.filter(([, value]) => !isPaletteValue(value));

    expect(offenders).toEqual([]);
    expect(leaves.length).toBeGreaterThan(0);
  });

  it('rejects a colour that is not in the palette', () => {
    // The negative half of the rule above: the check discriminates, it does not pass everything.
    expect(isPaletteValue('#ff00ff')).toBe(false);
    expect(isPaletteValue(Palette.purple500)).toBe(true);
  });

  it('populates every role in every colour group', () => {
    const empties = leaves.filter(([, value]) => !isPopulated(value));

    expect(empties).toEqual([]);
    expect(Object.keys(lightTheme.colors)).toEqual([
      'primary',
      'surface',
      'text',
      'border',
      'feedback',
    ]);
  });

  it('reports an unpopulated role rather than accepting it', () => {
    expect(isPopulated('')).toBe(false);
    expect(isPopulated(undefined)).toBe(false);
  });

  it('leaves the canvas backdrop out of the theme — it is not a screen colour', () => {
    const values = leaves.map(([, value]) => value);

    expect(values).not.toContain(Palette.neutral150);
    expect(values).toContain(Palette.neutral50);
  });
});

describe('lightTheme scales', () => {
  it('surfaces the primitive spacing, radius, and shadow scales without re-declaring them', () => {
    expect(lightTheme.spacing).toBe(Spacing);
    expect(lightTheme.borderRadius).toBe(Radii);
    expect(lightTheme.shadows).toBe(Shadows);
  });

  it('caps the OS font-scale multiplier once, on the theme', () => {
    expect(lightTheme.maxFontSizeMultiplier).toBe(FontScale.max);
    expect(lightTheme.maxFontSizeMultiplier).toBeGreaterThan(1);
  });
});

describe('lightTheme typography', () => {
  const variants = Object.entries(lightTheme.typography) as [
    keyof Theme['typography'],
    Record<string, unknown>,
  ][];

  it('builds every named variant from the primitive type scales only', () => {
    const offenders = variants
      .filter(([, style]) => !isPrimitiveTextStyle(style))
      .map(([name]) => name);

    expect(offenders).toEqual([]);
    expect(variants.length).toBeGreaterThan(0);
  });

  it('rejects a variant that reaches outside the primitive scales', () => {
    // Same predicate, a style the design never draws: a system face at an unlisted size.
    expect(
      isPrimitiveTextStyle({
        fontFamily: 'Helvetica',
        fontSize: 13,
        lineHeight: 19,
        fontWeight: '800',
        letterSpacing: 1.4,
      }),
    ).toBe(false);
  });

  it('pairs each weight with the Inter file that actually carries it', () => {
    const weightForFamily: Record<string, string> = {
      [FontFamily.regular]: FontWeight.regular,
      [FontFamily.medium]: FontWeight.medium,
      [FontFamily.semiBold]: FontWeight.semiBold,
      [FontFamily.bold]: FontWeight.bold,
    };

    const mismatches = variants
      .filter(([, style]) => weightForFamily[String(style.fontFamily)] !== style.fontWeight)
      .map(([name]) => name);

    expect(mismatches).toEqual([]);
  });
});

describe('lightTheme declares no design value of its own', () => {
  const PRIMITIVE_VALUES = new Set<unknown>([
    ...Object.values(Palette),
    ...Object.values(Spacing),
    ...Object.values(Radii),
    ...Object.values(FontFamily),
    ...Object.values(FontSize),
    ...Object.values(FontWeight),
    ...Object.values(LineHeight),
    ...Object.values(LetterSpacing),
    ...Object.values(FontScale),
  ]);

  /**
   * The rule under test (AC-3): the semantic layer references `primitive/` and never
   * re-declares a literal. `shadows` is excluded because it is the primitive object itself,
   * asserted by identity above.
   */
  const findNonPrimitiveLeaf = (node: unknown): unknown => {
    if (typeof node === 'object' && node !== null) {
      for (const value of Object.values(node)) {
        const offender = findNonPrimitiveLeaf(value);

        if (offender !== undefined) {
          return offender;
        }
      }

      return undefined;
    }

    return PRIMITIVE_VALUES.has(node) ? undefined : node;
  };

  it('traces every colour and every text style back to primitive/', () => {
    expect(findNonPrimitiveLeaf(lightTheme.colors)).toBeUndefined();
    expect(findNonPrimitiveLeaf(lightTheme.typography)).toBeUndefined();
  });

  it('reports a literal that was written inline instead of referenced', () => {
    // Same walk, a fragment authored the wrong way round.
    expect(findNonPrimitiveLeaf({ text: { primary: '#ff0000' } })).toBe('#ff0000');
    expect(findNonPrimitiveLeaf({ body: { fontSize: 13 } })).toBe(13);
    expect(findNonPrimitiveLeaf({ body: { fontSize: FontSize.size16 } })).toBeUndefined();
  });
});
