import { categorySuggestions } from '../categorySuggestions';

const taskWith = (category: string): { category: string } => ({ category });

describe('categorySuggestions (AC-4, FR-15)', () => {
  it('offers each distinct category once, alphabetically', () => {
    const suggestions = categorySuggestions([
      taskWith('Work'),
      taskWith('Personal'),
      taskWith('Work'),
      taskWith('Urgent'),
    ]);

    expect(suggestions).toEqual(['Personal', 'Urgent', 'Work']);
  });

  it('drops the empty label the API allows, which is not a choice', () => {
    expect(categorySuggestions([taskWith(''), taskWith('Work'), taskWith('')])).toEqual(['Work']);
  });

  it('offers nothing when no loaded task carries a category', () => {
    expect(categorySuggestions([taskWith(''), taskWith('')])).toEqual([]);
    expect(categorySuggestions([])).toEqual([]);
  });

  it('treats two casings as two categories, because the label is what gets stored', () => {
    expect(categorySuggestions([taskWith('work'), taskWith('Work')])).toEqual(['work', 'Work']);
  });

  it('is derived, so a category disappears with the last task that carried it', () => {
    const before = categorySuggestions([taskWith('Work'), taskWith('Errands')]);
    const after = categorySuggestions([taskWith('Work')]);

    expect(before).toContain('Errands');
    expect(after).not.toContain('Errands');
  });
});
