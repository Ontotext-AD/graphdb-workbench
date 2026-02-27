import {ByteUtils} from '../byte-utils';

describe('ByteUtils', () => {
  describe('convertToBytes', () => {
    test('should return 0 for undefined input', () => {
      expect(ByteUtils.convertToBytes(undefined)).toBe(0);
    });

    test('should return 0 for null input', () => {
      expect(ByteUtils.convertToBytes(null)).toBe(0);
    });

    test('should return the number as-is when given a numeric value', () => {
      expect(ByteUtils.convertToBytes(0)).toBe(0);
      expect(ByteUtils.convertToBytes(123)).toBe(123);
      expect(ByteUtils.convertToBytes(1048576)).toBe(1048576);
    });

    test('should parse a digit-only string to an integer', () => {
      expect(ByteUtils.convertToBytes('0')).toBe(0);
      expect(ByteUtils.convertToBytes('123')).toBe(123);
      expect(ByteUtils.convertToBytes('4567')).toBe(4567);
    });

    test('should trim whitespace from the input string before parsing', () => {
      expect(ByteUtils.convertToBytes('  512  ')).toBe(512);
    });

    test('should convert "bytes" human-readable string to bytes', () => {
      expect(ByteUtils.convertToBytes('123 bytes')).toBe(123);
      expect(ByteUtils.convertToBytes('1 bytes')).toBe(1);
    });

    test('should convert KB human-readable string to bytes', () => {
      expect(ByteUtils.convertToBytes('1 KB')).toBe(1024);
      expect(ByteUtils.convertToBytes('1.5 KB')).toBe(1536);
      expect(ByteUtils.convertToBytes('432 KB')).toBe(432 * 1024);
    });

    test('should convert MB human-readable string to bytes', () => {
      expect(ByteUtils.convertToBytes('1 MB')).toBe(1024 ** 2);
      expect(ByteUtils.convertToBytes('2.5 MB')).toBe(2.5 * 1024 ** 2);
    });

    test('should convert GB human-readable string to bytes', () => {
      expect(ByteUtils.convertToBytes('1 GB')).toBe(1024 ** 3);
    });

    test('should convert TB human-readable string to bytes', () => {
      expect(ByteUtils.convertToBytes('1 TB')).toBe(1024 ** 4);
    });

    test('should convert PB human-readable string to bytes', () => {
      expect(ByteUtils.convertToBytes('1 PB')).toBe(1024 ** 5);
    });

    test('should be case-insensitive for unit labels', () => {
      expect(ByteUtils.convertToBytes('1 kb')).toBe(1024);
      expect(ByteUtils.convertToBytes('1 mb')).toBe(1024 ** 2);
      expect(ByteUtils.convertToBytes('1 BYTES')).toBe(1);
    });

    test('should return 0 for an unrecognised string', () => {
      expect(ByteUtils.convertToBytes('not-a-size')).toBe(0);
      expect(ByteUtils.convertToBytes('1 XB')).toBe(0);
      expect(ByteUtils.convertToBytes('')).toBe(0);
    });
  });

  describe('convertToHumanReadable', () => {
    test('should return "0 bytes" for falsy values', () => {
      expect(ByteUtils.convertToHumanReadable(0)).toBe('0 bytes');
      expect(ByteUtils.convertToHumanReadable('')).toBe('0 bytes');
    });

    test('should return "0 bytes" for NaN or negative values from a string', () => {
      expect(ByteUtils.convertToHumanReadable('abc')).toBe('0 bytes');
      expect(ByteUtils.convertToHumanReadable('-1')).toBe('0 bytes');
    });

    test('should return "0 bytes" for a negative number', () => {
      expect(ByteUtils.convertToHumanReadable(-100)).toBe('0 bytes');
    });

    test('should return the input string as-is when already human-readable', () => {
      expect(ByteUtils.convertToHumanReadable('1 KB')).toBe('1 KB');
      expect(ByteUtils.convertToHumanReadable('1.50 KB')).toBe('1.50 KB');
      expect(ByteUtils.convertToHumanReadable('123 bytes')).toBe('123 bytes');
    });

    test('should handle leading/trailing whitespace around a human-readable value', () => {
      expect(ByteUtils.convertToHumanReadable('  1 KB  ')).toBe('1 KB');
      expect(ByteUtils.convertToHumanReadable('  1.50 MB  ')).toBe('1.50 MB');
      expect(ByteUtils.convertToHumanReadable('  123 bytes  ')).toBe('123 bytes');
    });

    test('should convert bytes to "bytes" label', () => {
      expect(ByteUtils.convertToHumanReadable(1)).toBe('1 bytes');
      expect(ByteUtils.convertToHumanReadable(512)).toBe('512 bytes');
      expect(ByteUtils.convertToHumanReadable(1023)).toBe('1023 bytes');
    });

    test('should convert to KB', () => {
      expect(ByteUtils.convertToHumanReadable(1024)).toBe('1 KB');
      expect(ByteUtils.convertToHumanReadable(1536)).toBe('1.50 KB');
    });

    test('should convert to MB', () => {
      expect(ByteUtils.convertToHumanReadable(1048576)).toBe('1 MB');
      expect(ByteUtils.convertToHumanReadable(1572864)).toBe('1.50 MB');
    });

    test('should convert to GB', () => {
      expect(ByteUtils.convertToHumanReadable(1073741824)).toBe('1 GB');
    });

    test('should convert to TB', () => {
      expect(ByteUtils.convertToHumanReadable(1099511627776)).toBe('1 TB');
    });

    test('should convert to PB', () => {
      expect(ByteUtils.convertToHumanReadable(1125899906842624)).toBe('1 PB');
    });

    test('should convert a numeric string', () => {
      expect(ByteUtils.convertToHumanReadable('1048576')).toBe('1 MB');
      expect(ByteUtils.convertToHumanReadable('1024')).toBe('1 KB');
    });

    test('should not include decimal places for whole-number results', () => {
      const result = ByteUtils.convertToHumanReadable(1024);
      expect(result).toBe('1 KB');
      expect(result).not.toContain('.');
    });

    test('should include two decimal places for non-integer results', () => {
      expect(ByteUtils.convertToHumanReadable(1536)).toBe('1.50 KB');
    });
  });
});

