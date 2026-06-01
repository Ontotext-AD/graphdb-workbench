/**
 * ConfirmationConfig defines the structure of the configuration object used to display a confirmation dialog.
 * Generally, this exposes subset of the primeng's confirmation dialog configuration properties but applies some default
 * values and translations to simplify usage across the application.
 */
export interface ConfirmationConfig {
  /**
   * The message to display in the confirmation dialog body.
   */
  message: string;
  /**
   * The header text to display at the top of the confirmation dialog.
   */
  header: string;
  /**
   * An optional EventTarget to which the confirmation dialog should be anchored. This is useful for positioning the
   * dialog relative to a specific element in the UI, such as a button that triggered the confirmation. If not provided,
   * the dialog will be centered on the screen.
   */
  target?: EventTarget;
  /**
   * Configuration for the accept (confirm) button, including label, type (severity), and optional style class. If not
   * provided, default values will be used for the label and type.
   */
  acceptButton?: {
    label?: string;
    type?: string;
    styleClass?: string;
  };
  /**
   * Configuration for the reject (cancel) button, including label, type (severity), and optional style class. If not
   * provided, default values will be used for the label and type.
   */
  rejectButton?: {
    label?: string;
    type?: string;
    styleClass?: string;
  },
  /**
   * The handler function to execute when the user clicks the accept (confirm) button. This is a required property, as
   * the confirmation dialog must have a defined action to take when the user confirms. The function should contain the
   * logic for what should happen when the user accepts the confirmation, such as proceeding with a delete action or
   * navigating away from a page.
   */
  acceptHandler: () => void;
  /**
   * The handler function to execute when the user clicks the reject (cancel) button. This is an optional property; if
   * not provided, the dialog will only display an accept button. If provided, this function should contain the logic
   * for what should happen when the user cancels the confirmation, such as closing the dialog or preventing navigation.
   */
  rejectHandler?: () => void;
  /**
   * An optional flag to indicate whether the reject (cancel) button should be hidden. If set to false, only the accept
   * button will be displayed in the confirmation dialog, and the reject button will be completely removed from the UI.
   * This can be useful in scenarios where a cancellation option is not applicable or desired, such as when confirming a
   * non-destructive action or when you want to force the user to acknowledge a message without providing an option to
   * cancel.
   */
  rejectVisible?: boolean;
}
