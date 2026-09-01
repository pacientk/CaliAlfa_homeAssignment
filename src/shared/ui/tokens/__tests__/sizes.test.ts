import { Sizes } from '../primitive/sizes';
import { FontFamily, FontSize } from '../primitive/typography';
import { lightTheme } from '../themes/light';

/** Every rung is a width or a height the canvas sources actually draw. */
const CANVAS_DIMENSIONS = [20, 32, 36, 52, 56, 60, 64];

describe('the size scale', () => {
  it('surfaces the primitive scale on the theme without re-declaring it', () => {
    expect(lightTheme.sizes).toBe(Sizes);
  });

  it('holds only dimensions the canvas draws', () => {
    expect(Object.values(Sizes).sort((a, b) => a - b)).toEqual(CANVAS_DIMENSIONS);
  });

  it('names every rung after its own magnitude, as spacing and radii do', () => {
    const mismatches = Object.entries(Sizes).filter(([name, value]) => name !== `size${value}`);

    expect(mismatches).toEqual([]);
  });

  it('reports a rung whose name and value disagree rather than accepting it', () => {
    const mismatches = Object.entries({ size52: 48 }).filter(
      ([name, value]) => name !== `size${value}`,
    );

    expect(mismatches).toEqual([['size52', 48]]);
  });
});

describe('the icon scale', () => {
  it('is the font-size scale itself, so an icon size is never a second copy of a number', () => {
    expect(lightTheme.iconSizes).toBe(FontSize);
  });

  it('surfaces the icon face from the primitive font families', () => {
    expect(lightTheme.iconFontFamily).toBe(FontFamily.icon);
    expect(lightTheme.iconFontFamily).not.toBe(FontFamily.regular);
  });
});
