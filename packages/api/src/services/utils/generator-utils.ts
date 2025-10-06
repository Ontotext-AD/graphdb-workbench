/**
 * Utility class for generating various values.
 */
export class GeneratorUtils {
  /**
   * Generates a pseudo random UUID (Universally Unique Identifier).
   *
   * This method creates a version 4 UUID, which is based on random numbers.
   * The generated UUID follows the RFC 4122 standard format.
   *
   * @returns A string representing the randomly generated UUID in the format
   * 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx' where x is any hexadecimal digit
   * and y is one of 8, 9, a, or b.
   */
  static uuid(): string {
    const HEX_RADIX = 16;
    const UUID_V4_TEMPLATE = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    const VARIANT_BITMASK = 0x3;
    const VARIANT_VALUE = 0x8;

    let timestamp = new Date().getTime();
    let performanceNow = (performance?.now() ?? 0) * 1000;

    return UUID_V4_TEMPLATE.replace(/[xy]/g, (char) => {
      let random = Math.random() * HEX_RADIX;

      if (timestamp > 0) {
        random = (timestamp + random) % HEX_RADIX | 0;
        timestamp = Math.floor(timestamp / HEX_RADIX);
      } else {
        random = (performanceNow + random) % HEX_RADIX | 0;
        performanceNow = Math.floor(performanceNow / HEX_RADIX);
      }

      const value = char === 'x' ? random : (random & VARIANT_BITMASK) | VARIANT_VALUE;
      return value.toString(HEX_RADIX);
    });
  }

  /**
   * Generates a random hexadecimal string of specified length.
   *
   * @param length - Number of hex bytes to generate (result will be length * 2 characters).
   * @returns A hexadecimal string with zero-padded bytes.
   */
  static generateRandomString(length: number): string {
    const HEX_RADIX = 16;
    const result: string[] = [];

    let seed = Date.now() ^ (performance?.now() ?? 0);

    for (let i = 0; i < length; i++) {
      seed = (seed * 9301 + 49297) % 233280; // simple LCG
      const rand = seed % 256;
      const hex = rand.toString(HEX_RADIX).padStart(2, '0');
      result.push(hex);
    }

    return result.join('');
  }

  /**
   * Returns a hash code from a string
   * @param  {String} str The string to hash.
   * @return {Number}    A 32bit integer
   */
  static hashCode(str: string): number {
    let hash = 0;
    for (let i = 0, len = str.length; i < len; i++) {
      const chr = str.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }
}
