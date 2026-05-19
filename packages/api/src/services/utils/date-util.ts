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

  /**
   * Converts a duration in seconds to a human-readable string (e.g. `"1d 2h 3m 4s"`).
   * Leading zero components are omitted. Returns `"-"` for falsy or non-positive input.
   */
  static formatDuration(s: number): string {
    if (!s || s <= 0) {
      return '-';
    }
    const days = Math.floor(s / 86400);
    const hours = Math.floor((s % 86400) / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const seconds = Math.round(s % 60);
    let message = '';
    if (days) {
      message += days + 'd ';
    }
    if (days || hours) {
      message += hours + 'h ';
    }
    if (days || hours || minutes) {
      message += minutes + 'm ';
    }
    message += seconds + 's';
    return message.replace(/( 0[a-z])+$/, '');
  }
}
