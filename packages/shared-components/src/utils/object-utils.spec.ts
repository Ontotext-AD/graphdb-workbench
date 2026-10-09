import {parseJsonIfString} from './object-utils';

describe('parseJsonIfString', () => {
  const object = {a: 1, b: {c: 'text'}};

  it('returns an object as it is', () => {
    expect(parseJsonIfString(object)).toBe(object);
  });

  it('parses a JSON text to an object', () => {
    expect(parseJsonIfString(JSON.stringify(object))).toEqual(object);
  });

  it('returns undefined for null, undefined and an empty string', () => {
    expect(parseJsonIfString(null)).toBeUndefined();
    expect(parseJsonIfString(undefined)).toBeUndefined();
    expect(parseJsonIfString('')).toBeUndefined();
  });

  it('throws for a text that is not a valid JSON', () => {
    expect(() => parseJsonIfString('{not a json')).toThrow(SyntaxError);
  });
});
