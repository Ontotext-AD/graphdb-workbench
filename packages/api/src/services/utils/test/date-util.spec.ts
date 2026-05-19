import {DateUtil} from '../date-util';

describe('DateUtil', () => {
  describe('formatDuration', () => {
    test('should return "-" for zero', () => {
      expect(DateUtil.formatDuration(0)).toBe('-');
    });

    test('should return "-" for negative values', () => {
      expect(DateUtil.formatDuration(-10)).toBe('-');
    });

    test('should format seconds only', () => {
      expect(DateUtil.formatDuration(45)).toBe('45s');
    });

    test('should format minutes and seconds', () => {
      expect(DateUtil.formatDuration(125)).toBe('2m 5s');
    });

    test('should format hours, minutes and seconds', () => {
      expect(DateUtil.formatDuration(3661)).toBe('1h 1m 1s');
    });

    test('should format days, hours, minutes and seconds', () => {
      expect(DateUtil.formatDuration(90061)).toBe('1d 1h 1m 1s');
    });

    test('should omit trailing zero components', () => {
      expect(DateUtil.formatDuration(3600)).toBe('1h');
      expect(DateUtil.formatDuration(60)).toBe('1m');
      expect(DateUtil.formatDuration(86400)).toBe('1d');
    });
  });
});