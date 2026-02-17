/**
 * Utility class for date-related operations.
 */
export class DateUtil {
  /**
   * Returns the current timestamp in milliseconds since the Unix epoch.
   *
   * @return The current timestamp in milliseconds.
   */
  static now(): number {
    return Date.now();
  }
}
