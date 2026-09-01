import { validateTitle as validateTitleFromPackage } from '@entities/task';

import type { TitleValidationInput } from '../validateTitle';
import { validateTitle } from '../validateTitle';

/**
 * The seed data on the live service already holds two records called "Gloves".
 * The rules constrain what this app creates; they never invalidate what the
 * server already returned, so the duplicate fixture deliberately keeps both.
 */
const EXISTING_TITLES: readonly string[] = ['Gloves', 'Gloves', 'Buy milk', 'Ship the spec'];

const inputOf = (overrides: Partial<TitleValidationInput> = {}): TitleValidationInput => ({
  raw: 'A brand new title',
  existingTitles: EXISTING_TITLES,
  ...overrides,
});

describe('validateTitle — empty', () => {
  it('rejects an empty string', () => {
    expect(validateTitle(inputOf({ raw: '' }))).toBe('empty');
  });

  it('rejects a title made only of spaces', () => {
    expect(validateTitle(inputOf({ raw: '   ' }))).toBe('empty');
  });

  it('rejects a title made only of a tab', () => {
    expect(validateTitle(inputOf({ raw: '\t' }))).toBe('empty');
  });

  it('rejects a title mixing spaces, a tab and a newline', () => {
    expect(validateTitle(inputOf({ raw: ' \t\n ' }))).toBe('empty');
  });

  it('accepts a single non-space character', () => {
    expect(validateTitle(inputOf({ raw: 'a' }))).toBeUndefined();
  });
});

describe('validateTitle — padded', () => {
  it('rejects a title with a leading space', () => {
    expect(validateTitle(inputOf({ raw: ' Walk the dog' }))).toBe('padded');
  });

  it('rejects a title with a trailing space', () => {
    expect(validateTitle(inputOf({ raw: 'Walk the dog ' }))).toBe('padded');
  });

  it('rejects a title with a leading tab', () => {
    expect(validateTitle(inputOf({ raw: '\tWalk the dog' }))).toBe('padded');
  });

  it('accepts spaces inside the title', () => {
    expect(validateTitle(inputOf({ raw: 'Walk the dog' }))).toBeUndefined();
  });

  it('accepts a title whose padded form would have been a duplicate, reporting padded first', () => {
    expect(validateTitle(inputOf({ raw: ' Buy milk ' }))).toBe('padded');
  });
});

describe('validateTitle — duplicate', () => {
  it('rejects a title that differs from an existing one only in case', () => {
    expect(validateTitle(inputOf({ raw: 'gloves' }))).toBe('duplicate');
  });

  it('rejects a title that repeats an existing one exactly', () => {
    expect(validateTitle(inputOf({ raw: 'Buy milk' }))).toBe('duplicate');
  });

  it('compares against the trimmed form of a stored title', () => {
    expect(
      validateTitle(inputOf({ raw: 'Feed the cat', existingTitles: ['  Feed the cat  '] })),
    ).toBe('duplicate');
  });

  it('accepts a near miss that is not the same title', () => {
    expect(validateTitle(inputOf({ raw: 'Glove' }))).toBeUndefined();
  });

  it('accepts a clean unique title against an empty list', () => {
    expect(validateTitle(inputOf({ raw: 'Gloves', existingTitles: [] }))).toBeUndefined();
  });
});

describe('validateTitle — the task being edited', () => {
  it('accepts the edited task keeping its own title unchanged', () => {
    expect(
      validateTitle(inputOf({ raw: 'Buy milk', editingTaskTitle: 'Buy milk' })),
    ).toBeUndefined();
  });

  it('accepts the edited task keeping its own title when the seed data repeats it', () => {
    expect(validateTitle(inputOf({ raw: 'Gloves', editingTaskTitle: 'Gloves' }))).toBeUndefined();
  });

  it('accepts a case-only change to the edited task own title', () => {
    expect(
      validateTitle(inputOf({ raw: 'buy MILK', editingTaskTitle: 'Buy milk' })),
    ).toBeUndefined();
  });

  it('still rejects the edited task taking a different task title', () => {
    expect(validateTitle(inputOf({ raw: 'Gloves', editingTaskTitle: 'Buy milk' }))).toBe(
      'duplicate',
    );
  });

  it('still rejects an empty title while editing', () => {
    expect(validateTitle(inputOf({ raw: '   ', editingTaskTitle: 'Buy milk' }))).toBe('empty');
  });

  it('still rejects a padded form of the edited task own title', () => {
    expect(validateTitle(inputOf({ raw: ' Buy milk', editingTaskTitle: 'Buy milk' }))).toBe(
      'padded',
    );
  });
});

describe('validateTitle — evaluation order', () => {
  it('reports a whitespace-only title as empty rather than padded', () => {
    expect(validateTitle(inputOf({ raw: '   ' }))).not.toBe('padded');
    expect(validateTitle(inputOf({ raw: '   ' }))).toBe('empty');
  });

  it('reports a padded duplicate as padded rather than duplicate', () => {
    expect(validateTitle(inputOf({ raw: 'Buy milk ' }))).not.toBe('duplicate');
    expect(validateTitle(inputOf({ raw: 'Buy milk ' }))).toBe('padded');
  });
});

describe('validateTitle — normalisation', () => {
  it('does not trim on the user behalf: the caller keeps the raw value', () => {
    const input = inputOf({ raw: ' Walk the dog ' });

    validateTitle(input);

    expect(input.raw).toBe(' Walk the dog ');
  });
});

describe('the task entity package barrel', () => {
  it('exposes validateTitle to callers outside the entity', () => {
    expect(validateTitleFromPackage).toBe(validateTitle);
  });
});
