/**
 * Converts a string to the corresponding enum value.
 * @param enumObj - The enum object to convert the string to.
 * @param value - The string value to convert.
 * @returns The corresponding enum value.
 * @throws Error if the value is not a valid enum value.
 */
export function toEnum<T extends Record<string, string>>(enumObj: T, value: string): T[keyof T] {
  const values = Object.values(enumObj) as unknown as string[];
  if (values.includes(value)) {
    return value as T[keyof T];
  }
  throw new Error(`Invalid enum value '${value}' for enum ${JSON.stringify(enumObj)}`);
}
