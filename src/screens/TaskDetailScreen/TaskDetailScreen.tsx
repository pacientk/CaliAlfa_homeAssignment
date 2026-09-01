import { strings } from '@lib/strings';
import { PlaceholderScreen } from '@widgets/PlaceholderScreen';
import type { JSX } from 'react';

import type { ITaskDetailScreenProps } from './ITaskDetailScreen';

/**
 * Placeholder for artboard B8. T-011 replaces the body.
 *
 * The id is shown rather than ignored so that the route parameter is visibly carried across
 * the navigation boundary — a parameter nothing reads is a parameter nobody notices is wrong.
 */
export const TaskDetailScreen = ({ taskId, onClose }: ITaskDetailScreenProps): JSX.Element => (
  <PlaceholderScreen
    title={strings.taskDetail.title}
    subtitle={taskId}
    actions={[{ label: strings.taskDetail.close, onPress: onClose }]}
  />
);
