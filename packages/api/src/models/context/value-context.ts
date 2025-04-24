import {ObjectUtil} from '../../services/utils';
import {ValueChangeCallback} from './value-change-callback';
import {Copyable} from '../common';
import {BeforeChangeValidationPromise} from './before-change-validation-promise';

/**
 * ValueContext is a generic class for managing a value of type T. It provides functionality to set and retrieve the value,
 * as well as to subscribe to changes in the value through callback functions.
 *
 * This class ensures that the value is only updated when it changes (based on a deep equality check),
 * and subscribers are notified with a copy of the updated value if it's an object, or the value itself if it's a primitive.
 *
 * @template T - The type of the value being managed. It can be any type, including primitives and objects.
 */
export class ValueContext<T> {
  private value: T | undefined;
  private callbackFunctions: ValueChangeCallback<T>[] = [];
  private beforeChangeValidationPromises: BeforeChangeValidationPromise<T>[] = [];

  /**
   * Sets the value of the context. If the new value is different from the current value
   * (determined using a deep equality check), the value is updated and all subscribed
   * callback functions are notified.
   *
   * @param value - The new value to set for the context. If the new value differs from the current value,
   * the context is updated, and subscribers are notified.
   */
  setValue(value: T): void {
    if (!ObjectUtil.deepEqual(this.value, value)) {
      this.value = this.getCopy(value);
      this.callbackFunctions.forEach(callbackFunction => callbackFunction(this.getValue()));
    }
  }

  /**
   * Retrieves the current value of the context.
   * If the value is an object, a deep copy is returned to ensure immutability.
   * For primitives, the value itself is returned.
   *
   * @returns The current value, or `undefined` if no value is set.
   */
  getValue(): T | undefined {
    return this.getCopy(this.value);
  }

  /**
   * Registers a <code>ValueChangeCallback</code> to be notified when the value changes. The callback function will be called
   * whenever the value is updated, and it will receive the updated value.
   *
   * Optionally, a <code>BeforeChangeValidationPromise</code> function can be provided to validate value changes before they occur.
   * This validation will be checked during the value update execution.
   *
   * This method returns a function to unsubscribe both the callback and validation promise,
   * which can be called to stop receiving updates and remove the validation.
   *
   * @param callbackFunction - The callback function to subscribe, which will be invoked with the updated
   *                           value of type T whenever the value changes.
   * @param beforeChangeValidationPromise - Optional validation function that returns a promise resolving to
   *                                        a boolean indicating whether a value change should be allowed.
   * @returns A function to unsubscribe both the callback and validation promise, removing them from their respective lists.
   */
  subscribe(callbackFunction: ValueChangeCallback<T | undefined>, beforeChangeValidationPromise?: BeforeChangeValidationPromise<T>): () => void {
    this.callbackFunctions.push(callbackFunction);
    if (beforeChangeValidationPromise) {
      this.beforeChangeValidationPromises.push(beforeChangeValidationPromise);
    }
    return () => {
      this.callbackFunctions = this.callbackFunctions.filter(fn => fn !== callbackFunction);
      this.beforeChangeValidationPromises = this.beforeChangeValidationPromises.filter(fn => fn !== beforeChangeValidationPromise);
    };
  }

  /**
   * Checks if the provided value can be used to update the context by validating it against all registered
   * validation promises.
   *
   * This method executes all registered validation functions asynchronously and returns true only if all
   * validation functions approve the update. If any validation fails or throws an error, the update is
   * considered invalid.
   *
   * @param value - The value to validate before updating the context.
   * @returns A promise that resolves to true if all validation functions approve the update, false otherwise.
   */
  async canUpdate(value: T): Promise<boolean> {
    if (this.beforeChangeValidationPromises.length === 0) {
      return true; // No validation functions registered, so the update is allowed by default.
    }
    const beforeChangePromises = this.beforeChangeValidationPromises.map(validator => validator(value));
    try {
      const allResults = await Promise.all(beforeChangePromises);
      return allResults.every(result => result);
    } catch {
      return false;
    }
  }

  /**
   * Creates a deep copy of the given value if it's an object. For primitives, the value itself is returned.
   *
   * @param value - The value to copy.
   * @returns A deep copy of the value if it's an object, or the value itself if it's a primitive.
   */
  private getCopy(value: T | undefined): T | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    if (ObjectUtil.hasCopyMethod(value)) {
      // The as unknown as Copyable<T> casting is used to tell TypeScript that value is of type Copyable<T> (even if TypeScript can't deduce it automatically).
      return (value as unknown as Copyable<T>).copy();
    }
    return ObjectUtil.deepCopy(value) as T;
  }
}
