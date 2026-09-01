import { strings } from '@lib/strings';
import { ROUTES } from '@navigation/constants/routes';

import { isMainTabRoute, TAB_ITEMS } from '../tabItems';

describe('the tab bar route guard', () => {
  it('recognises every route the tab navigator registers', () => {
    expect(isMainTabRoute(ROUTES.TASK_LIST)).toBe(true);
    expect(isMainTabRoute(ROUTES.CALENDAR)).toBe(true);
    expect(isMainTabRoute(ROUTES.SETTINGS)).toBe(true);
  });

  it('rejects a route the bar was never told how to draw', () => {
    expect(isMainTabRoute(ROUTES.NEW_TASK)).toBe(false);
    expect(isMainTabRoute('toString')).toBe(false);
  });
});

describe('the tab items', () => {
  it('uses the glyphs and labels the design draws', () => {
    expect(TAB_ITEMS[ROUTES.TASK_LIST]).toEqual({
      icon: 'check_box',
      label: strings.tabs.tasks,
    });
    expect(TAB_ITEMS[ROUTES.CALENDAR]).toEqual({
      icon: 'calendar_month',
      label: strings.tabs.calendar,
    });
    expect(TAB_ITEMS[ROUTES.SETTINGS]).toEqual({
      icon: 'settings',
      label: strings.tabs.settings,
    });
  });
});
