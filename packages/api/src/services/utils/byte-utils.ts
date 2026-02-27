/**
 * A mapping of human-readable size units to their corresponding byte values.
 */
const HUMAN_READABLE_SIZE_UNITS: Record<string, number> = {
  BYTES: 1,
  KB: 1024,
  MB: 1024 ** 2,
  GB: 1024 ** 3,
  TB: 1024 ** 4,
  PB: 1024 ** 5
};

/**
 * A regular expression to match human-readable size strings.
 * Example matches: "123 bytes", "1.5 KB", "1 GB", etc.
 */
const IS_HUMAN_READABLE_SIZE_REGEX = /^(\d+(?:\.\d+)?)\s*(bytes|KB|MB|GB|TB|PB)$/i;

/**
 * A regular expression to match strings containing only digits.
 * Example matches: "123", "4567", etc.
 */
const IS_DIGIT_ONLY_REGEX = /^\d+$/;

/**
 * Utility class for converting between byte values and human-readable size strings.
 */
export class ByteUtils {

  /**
   * Converts the given `size` to bytes as a number.
   *
   * The `size` parameter can be passed in the following forms:
   * - As a number, e.g., `123`, `432`, etc.
   * - As a string representing a number, e.g., `"123"`, `"432"`, etc.
   * - As a human-readable string with units, e.g., `"123 bytes"`, `"432 KB"`, etc.
   *
   * @param size - The size to convert.
   * @returns The size in bytes. Returns `0` if the input is invalid.
   */
  static convertToBytes(size: number | string | undefined | null): number {
    if (size === undefined || size === null) {
      return 0;
    }

    if (typeof size === 'number') {
      return size;
    }

    size = size.trim();

    if (IS_DIGIT_ONLY_REGEX.test(size)) {
      return parseInt(size, 10);
    }

    const match = size.match(IS_HUMAN_READABLE_SIZE_REGEX);
    if (!match) {
      return 0;
    }

    const value = parseFloat(match[1]);
    const unit = match[2];

    return value * HUMAN_READABLE_SIZE_UNITS[unit.toUpperCase()];
  }

  /**
   * Converts the given `size` in bytes to a human-readable string.
   *
   * If the size is already a human-readable string, it will be returned as-is.
   *
   * @param size - The size in bytes to convert. Can be a number or a string.
   * @returns A human-readable size string, e.g., `"1.50 KB"`, `"100 MB"`.
   *          Returns `"0 bytes"` if the input is invalid or less than or equal to `0`.
   */
  static convertToHumanReadable(size: number | string | null | undefined): string {
    if (!size) {
      return '0 bytes';
    }

    if (typeof size === 'string') {
      size = size.trim();
    }

    if (IS_HUMAN_READABLE_SIZE_REGEX.test(String(size))) {
      return String(size);
    }

    if (typeof size === 'string') {
      size = parseFloat(size);
    }

    if (isNaN(size) || size <= 0) {
      return '0 bytes';
    }

    const units = Object.keys(HUMAN_READABLE_SIZE_UNITS).reverse();

    for (const unit of units) {
      const unitValue = HUMAN_READABLE_SIZE_UNITS[unit];
      if (size >= unitValue) {
        const readableSize = size / unitValue;
        const formattedSize = Number.isInteger(readableSize)
          ? readableSize
          : readableSize.toFixed(2);
        return `${formattedSize} ${unit === 'BYTES' ? 'bytes' : unit}`;
      }
    }

    return '0 bytes';
  }
}

