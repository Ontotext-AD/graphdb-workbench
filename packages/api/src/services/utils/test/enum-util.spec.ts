import {toEnum} from '../enum-util';

describe('enum-util', () => {
  describe('toEnum', () => {
    const TestEnum = {
      VALUE_ONE: 'VALUE_ONE',
      VALUE_TWO: 'VALUE_TWO',
      VALUE_THREE: 'VALUE_THREE',
    } as const;

    const StatusEnum = {
      ACTIVE: 'ACTIVE',
      INACTIVE: 'INACTIVE',
      PENDING: 'PENDING',
    } as const;

    const EmptyEnum = {} as const;

    test('should return the correct enum value when given a valid string', () => {
      const result = toEnum(TestEnum, 'VALUE_ONE');
      expect(result).toBe('VALUE_ONE');
    });

    test('should return the correct enum value for all valid values', () => {
      expect(toEnum(TestEnum, 'VALUE_ONE')).toBe('VALUE_ONE');
      expect(toEnum(TestEnum, 'VALUE_TWO')).toBe('VALUE_TWO');
      expect(toEnum(TestEnum, 'VALUE_THREE')).toBe('VALUE_THREE');
    });

    test('should work with different enum objects', () => {
      expect(toEnum(StatusEnum, 'ACTIVE')).toBe('ACTIVE');
      expect(toEnum(StatusEnum, 'INACTIVE')).toBe('INACTIVE');
      expect(toEnum(StatusEnum, 'PENDING')).toBe('PENDING');
    });

    test('should throw an error when given an invalid enum value', () => {
      expect(() => toEnum(TestEnum, 'INVALID_VALUE')).toThrow();
    });

    test('should throw an error with a descriptive message for invalid values', () => {
      expect(() => toEnum(TestEnum, 'INVALID_VALUE')).toThrow(
        `Invalid enum value 'INVALID_VALUE' for enum ${JSON.stringify(TestEnum)}`
      );
    });

    test('should throw an error when given an empty string', () => {
      expect(() => toEnum(TestEnum, '')).toThrow();
    });

    test('should throw an error when given a null value', () => {
      expect(() => toEnum(TestEnum, null as never)).toThrow();
    });

    test('should throw an error when given an undefined value', () => {
      expect(() => toEnum(TestEnum, undefined as never)).toThrow();
    });

    test('should throw an error when given a value with wrong case', () => {
      expect(() => toEnum(TestEnum, 'value_one')).toThrow();
    });

    test('should throw an error when given a partial match', () => {
      expect(() => toEnum(TestEnum, 'VALUE')).toThrow();
    });

    test('should throw an error when enum is empty and any value is provided', () => {
      expect(() => toEnum(EmptyEnum, 'ANY_VALUE')).toThrow();
    });

    test('should return the value as the correct type', () => {
      const result = toEnum(TestEnum, 'VALUE_ONE');
      // TypeScript type checking ensures this, but we can verify the value
      const validValues: (typeof TestEnum[keyof typeof TestEnum])[] = ['VALUE_ONE', 'VALUE_TWO', 'VALUE_THREE'];
      expect(validValues).toContain(result);
    });

    test('should handle enum with numeric-looking string values', () => {
      const NumericEnum = {
        ONE: '1',
        TWO: '2',
        THREE: '3',
      } as const;

      expect(toEnum(NumericEnum, '1')).toBe('1');
      expect(toEnum(NumericEnum, '2')).toBe('2');
      expect(() => toEnum(NumericEnum, '4')).toThrow();
    });

    test('should handle enum with special characters', () => {
      const SpecialEnum = {
        HYPHEN_VALUE: 'HYPHEN-VALUE',
        UNDERSCORE_VALUE: 'UNDERSCORE_VALUE',
        DOT_VALUE: 'DOT.VALUE',
      } as const;

      expect(toEnum(SpecialEnum, 'HYPHEN-VALUE')).toBe('HYPHEN-VALUE');
      expect(toEnum(SpecialEnum, 'UNDERSCORE_VALUE')).toBe('UNDERSCORE_VALUE');
      expect(toEnum(SpecialEnum, 'DOT.VALUE')).toBe('DOT.VALUE');
    });

    test('should be case-sensitive', () => {
      expect(() => toEnum(TestEnum, 'VALUE_one')).toThrow();
      expect(() => toEnum(TestEnum, 'Value_One')).toThrow();
    });
  });
});

