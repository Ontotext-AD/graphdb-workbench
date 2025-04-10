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
});
