/**
 * Configuration class for individual toast messages.
 * Configuration options here will override the global ToastrConfig settings.
 */
export class ToastConfig {
  /**
   * The duration in milliseconds for which the toast notification will be displayed.
   */
  timeout?: number;

  /**
   * A function to be called when the toast notification is clicked.
   */
  onClick?: (event: Event) => void;

  /**
   * Remove the toast notification when it is clicked.
   */
  removeOnClick?: boolean;

  constructor(data?: Partial<ToastConfig>) {
    this.timeout = data?.timeout || 5000;
    this.onClick = data?.onClick;
    this.removeOnClick = data?.removeOnClick || false;
  }
}
