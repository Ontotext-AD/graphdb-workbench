import {ObjectUtil} from '../../services/utils';
import {ValueChangeCallback} from './value-change-callback';
import {Copyable} from '../common';

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
   * Register the <code>callbackFunction</code> to value changes. The callback function will be called
   * whenever the value is updated, and it will receive the updated value.
   *
   * This method returns a function to unsubscribe the callback, which can be called to stop receiving updates.
   *
   * @param callbackFunction - The callback function to subscribe, which will be invoked with the updated
   *                           value of type T whenever the value changes.
   * @returns A function to unsubscribe the callback, removing it from the notification list.
   */
  subscribe(callbackFunction: ValueChangeCallback<T | undefined>): () => void {
    this.callbackFunctions.push(callbackFunction);
    return () => {
      this.callbackFunctions = this.callbackFunctions.filter(fn => fn !== callbackFunction);
    };
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
