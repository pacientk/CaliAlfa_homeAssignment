import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { lightTheme } from '@ui/tokens';

/**
 * `AppIcon` renders a Material Symbols ligature by asking for a font family by name. If the
 * face is not in the bundle, or is registered under a different family, nothing fails — the
 * glyph silently falls back to the system font and the ligature renders as the literal word
 * "check_box". These assertions are the automated half of catching that; the other half is
 * looking at the simulator, which no test can do.
 */
const REPO_ROOT = resolve(__dirname, '../../..');
const ICON_FONT_FILE = 'MaterialSymbolsOutlined.ttf';
const ICON_FONT_PATH = resolve(REPO_ROOT, 'assets/fonts', ICON_FONT_FILE);
const TEXT_FONT_PATH = resolve(REPO_ROOT, 'assets/fonts/Inter-Regular.ttf');
const INFO_PLIST_PATH = resolve(REPO_ROOT, 'ios/CaliAlfa/Info.plist');

const TABLE_COUNT_OFFSET = 4;
const TABLE_DIRECTORY_OFFSET = 12;
const TABLE_RECORD_SIZE = 16;
const TABLE_TAG_LENGTH = 4;
const TABLE_OFFSET_FIELD = 8;
const NAME_HEADER_SIZE = 6;
const NAME_RECORD_SIZE = 12;
const FAMILY_NAME_ID = 1;
const WINDOWS_PLATFORM_ID = 3;

const findNameTableOffset = (file: Buffer): number => {
  const tableCount = file.readUInt16BE(TABLE_COUNT_OFFSET);

  for (let index = 0; index < tableCount; index += 1) {
    const record = TABLE_DIRECTORY_OFFSET + index * TABLE_RECORD_SIZE;
    const tag = file.toString('latin1', record, record + TABLE_TAG_LENGTH);

    if (tag === 'name') {
      return file.readUInt32BE(record + TABLE_OFFSET_FIELD);
    }
  }

  throw new Error('The font carries no name table, so it declares no family at all.');
};

/**
 * The family name UIKit registers the face under — name id 1 of the OpenType `name` table.
 * Windows-platform records are UTF-16 big-endian, which Node cannot decode directly, hence
 * the byte swap.
 */
const readFontFamilyName = (fontPath: string): string => {
  const file = readFileSync(fontPath);
  const nameTable = findNameTableOffset(file);
  const recordCount = file.readUInt16BE(nameTable + 2);
  const stringsOffset = nameTable + file.readUInt16BE(nameTable + 4);

  for (let index = 0; index < recordCount; index += 1) {
    const record = nameTable + NAME_HEADER_SIZE + index * NAME_RECORD_SIZE;
    const platformId = file.readUInt16BE(record);
    const nameId = file.readUInt16BE(record + 6);

    if (nameId === FAMILY_NAME_ID) {
      const length = file.readUInt16BE(record + 8);
      const start = stringsOffset + file.readUInt16BE(record + 10);
      const bytes = Buffer.from(file.subarray(start, start + length));

      return platformId === WINDOWS_PLATFORM_ID
        ? bytes.swap16().toString('utf16le')
        : bytes.toString('latin1');
    }
  }

  throw new Error('The font declares no family name.');
};

const readBundledFontNames = (): readonly string[] => {
  const plist = readFileSync(INFO_PLIST_PATH, 'utf8');
  const section = /<key>UIAppFonts<\/key>\s*<array>([\s\S]*?)<\/array>/.exec(plist);

  const body = section?.[1];

  if (body === undefined) {
    throw new Error('Info.plist declares no UIAppFonts array, so no font is registered.');
  }

  return [...body.matchAll(/<string>([^<]+)<\/string>/g)].map(match => match[1] ?? '');
};

describe('the bundled icon font', () => {
  it('ships the file the icon primitive needs', () => {
    expect(existsSync(ICON_FONT_PATH)).toBe(true);
  });

  it('declares the family name the theme asks for', () => {
    expect(readFontFamilyName(ICON_FONT_PATH)).toBe(lightTheme.iconFontFamily);
  });

  it('reads the family off the file rather than assuming it — Inter is not the icon face', () => {
    expect(readFontFamilyName(TEXT_FONT_PATH)).not.toBe(lightTheme.iconFontFamily);
  });

  it('is registered with the iOS app so the family resolves at runtime', () => {
    expect(readBundledFontNames()).toContain(ICON_FONT_FILE);
  });

  it('has not displaced the text faces T-001 bundled', () => {
    const bundled = readBundledFontNames();

    expect(bundled).toContain('Inter-Regular.ttf');
    expect(bundled).toContain('Inter-Medium.ttf');
    expect(bundled).toContain('Inter-SemiBold.ttf');
    expect(bundled).toContain('Inter-Bold.ttf');
  });
});
