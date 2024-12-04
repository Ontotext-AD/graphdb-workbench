/**
 * Mark a model as copied.
 *
 * This interface should be implemented by models whose need to provide
 * a method for creating a deep copy of the model. The `copy()` method should return
 * a new instance of the class with the same values, ensuring immutability.
 *
 * @template T - The type of the object that implements the `Copy` interface. The `copy()` method
 *                should return an instance of this type.
 */
export interface Copyable<T> {
  /**
   * Creates a deep copy of the current instance.
   *
   * @returns A new instance of the type `T` with the same properties and values as the original.
   */
  copy(): T;
}
