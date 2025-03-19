/**
 * Configuration class for individual toast messages.
 * Configuration options here will override the global ToastrConfig settings.
 */
export class ToastConfig {
  /**
   * The duration in milliseconds for which the toast notification will be displayed.
   */
  timeout: number;

  constructor(data?: Partial<ToastConfig>) {
    this.timeout = data?.timeout || 5000;
  }
}
