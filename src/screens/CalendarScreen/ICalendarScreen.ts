/**
 * The calendar tab is a coming-soon state, so its only behaviour is the way back.
 *
 * The screen takes the intent rather than a route, because navigation sits above screens in
 * the layer order and a screen that imports `ROUTES` fails lint. `MainTabs` binds it.
 */
export interface ICalendarScreenProps {
  /** Returns the user to the task list. */
  onBackToTasks: () => void;
}
