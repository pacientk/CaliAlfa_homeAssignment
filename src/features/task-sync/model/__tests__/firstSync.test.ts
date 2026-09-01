import { createFakePageSource } from '@features/task-sync/testing/taskSyncDoubles';
import { serverTaskOf } from '@features/task-sync/testing/taskSyncFixtures';

import { fetchAllTasks, FIRST_SYNC_MAX_PAGES } from '../firstSync';

const PAGE_SIZE = 2;

const pageOf = (...ids: string[]): ReturnType<typeof serverTaskOf>[] =>
  ids.map(id => serverTaskOf(id));

describe('fetchAllTasks — the first-sync pagination loop', () => {
  it('collects every record across three pages and stops on the short one', async () => {
    const pageSource = createFakePageSource();
    pageSource.script(pageOf('a1', 'a2'), pageOf('b1', 'b2'), pageOf('c1'));

    const tasks = await fetchAllTasks(pageSource, PAGE_SIZE);

    expect(tasks.map(task => task.id)).toEqual(['a1', 'a2', 'b1', 'b2', 'c1']);
    expect(pageSource.calls).toEqual([
      { page: 1, limit: PAGE_SIZE },
      { page: 2, limit: PAGE_SIZE },
      { page: 3, limit: PAGE_SIZE },
    ]);
  });

  it('does not ask for a fourth page once a short page has come back', async () => {
    const pageSource = createFakePageSource();
    pageSource.script(pageOf('a1', 'a2'), pageOf('b1', 'b2'), pageOf('c1'));

    await fetchAllTasks(pageSource, PAGE_SIZE);

    expect(pageSource.calls).toHaveLength(3);
  });

  it('treats the empty page past the end of the collection as the terminator, not an error', async () => {
    const pageSource = createFakePageSource();
    pageSource.script(pageOf('a1', 'a2'), []);

    const tasks = await fetchAllTasks(pageSource, PAGE_SIZE);

    expect(tasks.map(task => task.id)).toEqual(['a1', 'a2']);
    expect(pageSource.calls).toHaveLength(2);
  });

  it('issues exactly one request when the whole collection fits in the first page', async () => {
    const pageSource = createFakePageSource();
    pageSource.script(pageOf('a1'));

    const tasks = await fetchAllTasks(pageSource, PAGE_SIZE);

    expect(tasks).toHaveLength(1);
    expect(pageSource.calls).toEqual([{ page: 1, limit: PAGE_SIZE }]);
  });

  it('stops at the page cap when the server keeps returning full pages', async () => {
    const pageSource = createFakePageSource();
    const fullPages = Array.from({ length: FIRST_SYNC_MAX_PAGES + 5 }, (_unused, index) =>
      pageOf(`p${index}-1`, `p${index}-2`),
    );
    pageSource.script(...fullPages);

    const tasks = await fetchAllTasks(pageSource, PAGE_SIZE);

    expect(pageSource.calls).toHaveLength(FIRST_SYNC_MAX_PAGES);
    expect(tasks).toHaveLength(FIRST_SYNC_MAX_PAGES * PAGE_SIZE);
  });

  it('rejects with the failure the page request raised rather than returning a partial list', async () => {
    const pageSource = createFakePageSource();
    pageSource.script(pageOf('a1', 'a2'), new Error('network down'));

    await expect(fetchAllTasks(pageSource, PAGE_SIZE)).rejects.toThrow('network down');
  });
});
