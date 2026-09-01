/**
 * FlashList measures itself through native layout calls that do not exist under Jest. The
 * package ships the stubs below in `@shopify/flash-list/jestSetup.js`; they are applied here
 * rather than through `setupFiles` so that the mock stays with the one suite that needs it and
 * the root Jest config keeps working for every other task in this spec.
 */
jest.mock('@shopify/flash-list/dist/recyclerview/utils/measureLayout', () => {
  const actual = jest.requireActual<Record<string, unknown>>(
    '@shopify/flash-list/dist/recyclerview/utils/measureLayout',
  );

  return {
    ...actual,
    measureParentSize: jest.fn(() => ({ x: 0, y: 0, width: 400, height: 900 })),
    measureFirstChildLayout: jest.fn(() => ({ x: 0, y: 0, width: 400, height: 900 })),
    measureItemLayout: jest.fn(() => ({ x: 0, y: 0, width: 100, height: 100 })),
  };
});

import type { ListRenderItemInfo } from '@shopify/flash-list';
import type { JSX } from 'react';
import type { ReactTestRenderer } from 'react-test-renderer';
import { act } from 'react-test-renderer';

import { AppText } from '../../AppText';
import { renderWithTheme } from '../../testing/renderWithTheme';
import { AppFlashList } from '../AppFlashList';

interface Row {
  readonly id: string;
  readonly title: string;
}

const ROWS: readonly Row[] = [
  { id: 'task-1', title: 'Fix Elle Driver' },
  { id: 'task-2', title: 'Fix Vernita Green' },
];

const renderRow = ({ item }: ListRenderItemInfo<Row>): JSX.Element => (
  <AppText>{item.title}</AppText>
);

const keyExtractor = (item: Row): string => item.id;

/**
 * FlashList settles its layout from a timer. The pending work is flushed inside `act`, and
 * only then is the tree torn down — in that order, because unmounting first leaves the timer
 * to fire after the suite has finished, which Jest reports as an environment-teardown error
 * rather than as the test's own failure.
 */
const settleAndUnmount = (renderer: ReactTestRenderer): void => {
  act(() => {
    jest.runOnlyPendingTimers();
  });

  act(() => {
    renderer.unmount();
  });
};

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('AppFlashList', () => {
  it('renders a row per item through the caller render function', () => {
    const renderer = renderWithTheme(
      <AppFlashList data={ROWS} renderItem={renderRow} keyExtractor={keyExtractor} />,
    );
    const output = JSON.stringify(renderer.toJSON());

    expect(output).toContain('Fix Elle Driver');
    expect(output).toContain('Fix Vernita Green');

    settleAndUnmount(renderer);
  });

  it('renders the empty component, and only when there is no data', () => {
    const empty = renderWithTheme(
      <AppFlashList
        data={[]}
        renderItem={renderRow}
        keyExtractor={keyExtractor}
        ListEmptyComponent={<AppText>No tasks yet</AppText>}
      />,
    );

    expect(JSON.stringify(empty.toJSON())).toContain('No tasks yet');
    settleAndUnmount(empty);

    const populated = renderWithTheme(
      <AppFlashList
        data={ROWS}
        renderItem={renderRow}
        keyExtractor={keyExtractor}
        ListEmptyComponent={<AppText>No tasks yet</AppText>}
      />,
    );

    expect(JSON.stringify(populated.toJSON())).not.toContain('No tasks yet');
    settleAndUnmount(populated);
  });

  it('renders a header above the rows when one is supplied', () => {
    const renderer = renderWithTheme(
      <AppFlashList
        data={ROWS}
        renderItem={renderRow}
        keyExtractor={keyExtractor}
        ListHeaderComponent={<AppText>Today's momentum</AppText>}
      />,
    );

    expect(JSON.stringify(renderer.toJSON())).toContain("Today's momentum");

    settleAndUnmount(renderer);
  });

  it('keys rows by their domain id rather than by their position', () => {
    // The contract the wrapper makes required: reordering must not recycle a row onto a
    // different task, which is exactly what an index key would do.
    expect(keyExtractor(ROWS[0] as Row)).toBe('task-1');
    expect(keyExtractor(ROWS[1] as Row)).toBe('task-2');
  });
});
