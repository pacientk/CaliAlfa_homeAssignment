import type { ListRenderItem } from '@shopify/flash-list';
import type { ReactElement } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export interface IAppFlashListProps<TItem> {
  readonly data: readonly TItem[];
  /**
   * A named function or a stable component reference — never a closure that declares a
   * component, which would remount the whole row on every parent render.
   */
  readonly renderItem: ListRenderItem<TItem>;
  /**
   * Required, and required to return a stable domain id. An array index recycles a row onto
   * the wrong item the moment the list is filtered or reordered, which is precisely what the
   * search field on the task list does.
   */
  readonly keyExtractor: (item: TItem, index: number) => string;
  readonly ListHeaderComponent?: ReactElement | null;
  readonly ListEmptyComponent?: ReactElement | null;
  readonly contentContainerStyle?: StyleProp<ViewStyle>;
  /**
   * Anything the rows read that does not live on the item itself. Recycled rows re-render
   * only when this changes, so leaving it out is how a list goes stale.
   */
  readonly extraData?: unknown;
  readonly testID?: string;
}
