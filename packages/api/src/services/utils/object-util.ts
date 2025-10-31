export class ObjectUtil {

  /**
   * Performs a deep equality check between two values.
   *
   * This function compares two values to determine if they are deeply equal.
   * It supports comparison of primitives, arrays, and objects, including nested structures.
   *
   * @param obj1 - The first value to compare.
   * @param obj2 - The second value to compare.
   * @returns `true` if both values are deeply equal, otherwise `false`.
   *
   * @example
   * // Comparing two deeply nested objects
   * const obj1 = { a: 1, b: { c: [1, 2, 3], d: { e: 'hello' } } };
   * const obj2 = { a: 1, b: { c: [1, 2, 3], d: { e: 'hello' } } };
   * console.log(deepEqual(obj1, obj2)); // true
   *
   * @example
   * // Comparing two arrays with different values
   * const arr1 = [1, 2, 3];
   * const arr2 = [1, 2, 4];
   * console.log(deepEqual(arr1, arr2)); // false
   */
  static deepEqual(obj1: unknown, obj2: unknown): boolean {
    // Check if both values are strictly equal (handles primitives and references)
    if (obj1 === obj2) {
      return true;
    }

    // Check if either value is null or undefined
    if (obj1 === null || obj1 === undefined || obj2 === null || obj2 === undefined) {
      return false;
    }

    // Check if both values are objects
    if (typeof obj1 === 'object' && typeof obj2 === 'object') {
      // Ensure both have the same constructor (handles different types of objects, like Date, RegExp)
      if (obj1.constructor !== obj2.constructor) {
        return false;
      }

      // Handle arrays
      if (Array.isArray(obj1) && Array.isArray(obj2)) {
        // Check if both arrays have the same length
        if (obj1.length !== obj2.length) {
          return false;
        }

        // Compare each element recursively
        for (let i = 0; i < obj1.length; i++) {
          if (!ObjectUtil.deepEqual(obj1[i], obj2[i])) {
            return false;
          }
        }

        return true;
      }

      // Handle plain objects
      if (!Array.isArray(obj1) && !Array.isArray(obj2)) {
        const keys1 = Object.keys(obj1) as string[];
        const keys2 = Object.keys(obj2) as string[];

        // Check if both objects have the same number of keys
        if (keys1.length !== keys2.length) {
          return false;
        }

        // Check if all keys and values are deeply equal
        for (const key of keys1) {
          if (
            !(key in obj2) || // Ensure the key exists in obj2
            !ObjectUtil.deepEqual(
              (obj1 as Record<string, unknown>)[key],
              (obj2 as Record<string, unknown>)[key]
            )
          ) {
            return false;
          }
        }

        return true;
      }

      // If one is an array and the other is not, they are not equal
      return false;
    }

    // Default case: Not equal
    return false;
  }

  /**
   * Creates a deep copy of the given object.
   *
   * This method recursively copies all properties and values of the object,
   * handling different types such as primitives, arrays, plain objects, and built-in types.
   * It ensures that the copied object does not share references with the original object,
   * meaning that all nested structures are also copied independently.
   *
   * Special handling:
   * - Objects with a `copy()` method will use that method for cloning
   * - Date objects are cloned preserving their time value
   * - RegExp objects are cloned with their pattern and flags
   * - Map and Set objects are deeply cloned with their contents
   * - Arrays are deeply cloned with all elements
   * - Plain objects are recursively cloned
   *
   * @param obj - The object to be deeply copied. Can be any type, including primitives,
   *              arrays, objects, or built-in types.
   * @returns A deep copy of the object. If the input is a primitive, null, undefined,
   *          or a function, the original value is returned as-is.
   */
  static deepCopy(obj: unknown): unknown {
    // Handle primitives, null, undefined, and functions
    if (typeof obj !== 'object' || obj === null || obj === undefined || typeof obj === 'function') {
      return obj;
    }

    // Check if object has a custom copy method
    if (ObjectUtil.hasCopyMethod(obj)) {
      return (obj as { copy: () => unknown }).copy();
    }

    // Try to handle built-in types (including arrays)
    const builtInCopy = ObjectUtil.copyBuiltInType(obj);
    if (builtInCopy !== null) {
      return builtInCopy;
    }

    // Handle plain objects or objects with a prototype
    return ObjectUtil.copyPlainObject(obj);
  }

  /**
   * Attempts to copy built-in types like Array, Date, RegExp, Map, and Set.
   * @param obj - The object to copy.
   * @returns A copy of the object if it's a built-in type, or null if it's not a recognized built-in type.
   */
  private static copyBuiltInType(obj: unknown): unknown | null {
    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map(item => ObjectUtil.deepCopy(item));
    }

    // Handle Date objects
    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }

    // Handle RegExp objects
    if (obj instanceof RegExp) {
      return new RegExp(obj.source, obj.flags);
    }

    // Handle Map objects
    if (obj instanceof Map) {
      return new Map(
        Array.from(obj.entries()).map(([key, value]) => [
          ObjectUtil.deepCopy(key),
          ObjectUtil.deepCopy(value)
        ])
      );
    }

    // Handle Set objects
    if (obj instanceof Set) {
      return new Set(Array.from(obj.values()).map(value => ObjectUtil.deepCopy(value)));
    }

    return null;
  }

  /**
   * Creates a deep copy of a plain object.
   * @param obj - The object to copy.
   * @returns A deep copy of the object.
   */
  private static copyPlainObject(obj: object): Record<string, unknown> {
    const result: Record<string, unknown> = Object.create(Object.getPrototypeOf(obj));

    // Recursively copy each key-value pair
    for (const key of Object.keys(obj)) {
      result[key] = ObjectUtil.deepCopy((obj as Record<string, unknown>)[key]);
    }

    return result;
  }

  /**
   * Type guard to check if the value has a 'copy' method.
   * @param value - The value to check.
   * @returns True if the value has a 'copy' method, false otherwise.
   */
  static hasCopyMethod(value: unknown): boolean {
    return typeof value === 'object' && value !== null && Object.prototype.hasOwnProperty.call(value, 'copy') && typeof (value as { copy: unknown }).copy === 'function';
  }

  /**
   * Checks if the given object is null or undefined.
   * @param obj - The object to check.
   * @returns True if the object is null or undefined, false otherwise.
   */
  static isNullOrUndefined = (obj: unknown): boolean => {
    return obj === null || obj === undefined;
  };
}
