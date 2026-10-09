/**
 * Returns the given value as an object. A value that is not a string is returned as it is. A string is parsed
 * as JSON.
 *
 * It is for component properties that accept an object, or the same data as JSON text from consumers that can only
 * write the component as a tag in an HTML string.
 *
 * @template T - The type of the expected object
 * @param value - The object, or the JSON text that represents it
 * @returns The object, or `undefined` if the value is null, undefined or an empty string
 * @throws SyntaxError if the value is a string that is not a valid JSON
 *
 * @example
 * parseJsonIfString<{a: number}>('{"a": 1}'); // { a: 1 }
 * parseJsonIfString({a: 1}); // { a: 1 }
 * parseJsonIfString('not a json'); // throws SyntaxError
 */
export function parseJsonIfString<T>(value?: T | string | null): T | undefined {
  if (typeof value !== 'string') {
    return value ?? undefined;
  }
  return value ? JSON.parse(value) as T : undefined;
}
