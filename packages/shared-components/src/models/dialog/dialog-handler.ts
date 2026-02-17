export interface DialogHandler {
  /**
   * A method annotated with `@Listen` to handle the close event emitted by the dialog component.
   * This method should be implemented by any component that uses a dialog and needs to react to its closure.
   */
  onDialogClose: () => void;
}
