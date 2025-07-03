import {GeneratorUtils} from '../generator-utils';

describe('Generator Utils', () => {
  test('should generate same hash code for equal strings', () => {
    const str = 'hello world';
    const concatenatedStr = 'hello ' + 'world';
    expect(GeneratorUtils.hashCode(str)).toEqual(GeneratorUtils.hashCode(concatenatedStr));
  });

  test('should generate different hash codes for different strings', () => {
    const str1 = 'hello world';
    const str2 = 'hello universe';
    expect(GeneratorUtils.hashCode(str1)).not.toEqual(GeneratorUtils.hashCode(str2));
  });

  test('should generate a valid UUID', () => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
    expect(uuidRegex.test(GeneratorUtils.uuid())).toEqual(true);
  });

  test('should generate a different UUID for each call', () => {
    expect(GeneratorUtils.uuid()).not.toEqual(GeneratorUtils.uuid());
  });
});
