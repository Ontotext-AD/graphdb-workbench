/**
 * Utility class for generating various values.
 */
export class GeneratorUtils {
  /**
   * Generates a random UUID (Universally Unique Identifier) using the browser's crypto API.
   *
   * This method creates a version 4 UUID, which is based on random numbers.
   * The generated UUID follows the RFC 4122 standard format.
   *
   * @returns A string representing the randomly generated UUID in the format
   * 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx' where x is any hexadecimal digit
   * and y is one of 8, 9, a, or b.
   */
  static uuid(): string {
    return window.crypto.randomUUID();
  }
}
