import { malformedResponse, requestJson } from '@shared/api';

import type { Task, TaskChanges, TaskDraft } from './Task';
import { isTaskWire, toTask, toWireDraft, toWirePatch } from './taskMapper';

const TASKS_PATH = '/tasks';

const taskPath = (id: string): string => `${TASKS_PATH}/${encodeURIComponent(id)}`;

const isUnknownArray = (value: unknown): value is unknown[] => Array.isArray(value);

const parseTask = (value: unknown): Task => {
  if (!isTaskWire(value)) {
    throw malformedResponse('Expected a task record');
  }
  return toTask(value);
};

const parseTaskList = (value: unknown): Task[] => {
  if (!isUnknownArray(value)) {
    throw malformedResponse('Expected a list of task records');
  }
  return value.map(parseTask);
};

/** `GET /tasks?p={page}&l={limit}`. Pages are 1-based. */
export const fetchTaskPage = async (page: number, limit: number): Promise<Task[]> => {
  const body = await requestJson({
    method: 'GET',
    path: TASKS_PATH,
    query: { p: String(page), l: String(limit) },
  });
  return parseTaskList(body);
};

/** `POST /tasks`. Always sends `createdAt`, so the stored moment is the local one. */
export const createTask = async (draft: TaskDraft): Promise<Task> => {
  const body = await requestJson({
    method: 'POST',
    path: TASKS_PATH,
    body: toWireDraft(draft),
  });
  return parseTask(body);
};

/** `PUT /tasks/:id`. A merge — fields absent from `changes` keep their server value. */
export const updateTask = async (id: string, changes: TaskChanges): Promise<Task> => {
  const body = await requestJson({
    method: 'PUT',
    path: taskPath(id),
    body: toWirePatch(changes),
  });
  return parseTask(body);
};

/** `DELETE /tasks/:id`. Responds with the record it removed. */
export const deleteTask = async (id: string): Promise<Task> => {
  const body = await requestJson({ method: 'DELETE', path: taskPath(id) });
  return parseTask(body);
};
