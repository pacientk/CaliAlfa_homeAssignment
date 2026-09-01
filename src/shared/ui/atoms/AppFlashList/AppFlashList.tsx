import { FlashList } from '@shopify/flash-list';
import type { JSX } from 'react';

import type { IAppFlashListProps } from './IAppFlashList';

/**
 * The project's only list primitive.
 *
 * `docs/architecture/coding-rules.md § Lists` makes a recycling list the default rather than
 * an optimisation: the cost is one dependency and this file, paid once, against the cost of
 * converting every list screen plus a re-test of each later on. A `FlatList` "for now" is not
 * an option the project offers.
 *
 * The wrapper is deliberately thin. It exists to fix the two things reviews catch on every
 * list — a `keyExtractor` that returns an index, and a `renderItem` that declares a component
 * inline — by making the first required and typing the second as a stable render function.
 */
export const AppFlashList = <TItem,>({
  data,
  renderItem,
  keyExtractor,
  ListHeaderComponent,
  ListEmptyComponent,
  contentContainerStyle,
  extraData,
  testID,
}: IAppFlashListProps<TItem>): JSX.Element => (
  <FlashList
    data={data}
    renderItem={renderItem}
    keyExtractor={keyExtractor}
    ListHeaderComponent={ListHeaderComponent}
    ListEmptyComponent={ListEmptyComponent}
    contentContainerStyle={contentContainerStyle}
    extraData={extraData}
    testID={testID}
  />
);
