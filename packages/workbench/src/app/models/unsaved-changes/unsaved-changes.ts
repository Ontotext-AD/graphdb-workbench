/**
 * Contract for components that track unsaved state and can report it to
 * {@link UnsavedChangesService} to gate navigation away from the page.
 */
export interface UnsavedChanges {
  /**
   * Returns `true` when the component holds changes that have not been persisted.
   */
  hasUnsavedChanges(): boolean;
}
