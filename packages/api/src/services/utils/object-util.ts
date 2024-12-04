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
   * Creates a deep copy of the provided value.
   *
   * If the value implements a `copy` method, the method is invoked to create the copy.
   * For primitive values or objects that do not implement a `copy` method, the value
   * itself is returned since primitives are immutable by nature.
   *
   * @template T - The type of the value to be copied.
   * @param value - The value to be deep copied. It can be an object with a `copy` method or a primitive type.
   * @returns A deep copy of the value if a `copy` method exists, or the original value for primitives.
   */
  static deepCopy<T>(value: T): T {
    // Use a type guard to check if the value has a 'copy' method
    if (value && ObjectUtil.hasCopyMethod<T>(value)) {
      return value.copy();
    }
    // Otherwise, return the value directly (it may be a primitive)
    return value;
  }

  // Define a type guard for objects with a 'copy' method
  static hasCopyMethod<T>(value: unknown): value is { copy: () => T } {
    return typeof value === 'object' && value !== null && 'copy' in value && typeof value.copy === 'function';
  }
}
