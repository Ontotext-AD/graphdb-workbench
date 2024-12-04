import {ValueContext} from '../models/context/value-context';
import {ValueChangeCallback} from '../models/context/value-change-callback';
import {Service} from './service';

/**
 * Abstract service that manages the context for various properties and allows for value retrieval, updates
 * and subscriptions to value changes.
 */
export abstract class ContextService implements Service {

  /**
   * A map that stores the context for each property, keyed by property name.
   * The context holds the value and the list of subscribers (callback functions).
   */
  // eslint-disable-next-line @typescript-eslint/consistent-generic-constructors, @typescript-eslint/no-explicit-any
  private context: Map<string, ValueContext<any>> = new Map();

  /**
   * Updates the value of a specific property.
   *
   * @param propertyName The name of the property to be updated.
   * @param value The new value to be assigned to the property.
   *
   * @template T The type of the value to be set.
   */
  protected updateContextProperty<T>(propertyName: string, value: T): void {
    this.getOrCreateValueContext(propertyName).setValue(value);
  }

  /**
   * Retrieves the current value of a specific property.
   *
   * @param propertyName The name of the property to retrieve the value for.
   *
   * @returns The current value of the property, or `undefined` if no value is set.
   *
   * @template T The type of the value to be returned.
   */
  protected getContextPropertyValue<T>(propertyName: string): T | undefined {
    const valueContext = this.context.get(propertyName);
    return valueContext ? valueContext.getValue() : undefined;
  }

  /**
   * Register the <code>callbackFunction</code> that will be called when the value of property with <code>propertyName</code> changes.
   * It immediately calls the callback with the current value and then subscribes the callback for future changes to the property.
   *
   * @param propertyName The name of the property to subscribe to.
   * @param callbackFunction The callback function to be called when the property value changes.
   *                         It will receive the current value of the property as its argument.
   *
   * @returns A function that can be called to unsubscribe from the property updates.
   *
   * @template T The type of the value that the callback function will receive.
   */
  protected subscribe<T>(propertyName: string, callbackFunction: ValueChangeCallback<T | undefined>): () => void {
    if (callbackFunction) {
      // Call the callback immediately with the current value
      callbackFunction(this.getContextPropertyValue(propertyName));
    }
    // Return the unsubscribe function from the context
    return this.getOrCreateValueContext<T>(propertyName).subscribe(callbackFunction);
  }

  /**
   * Retrieves the value context for a specific property or creates a new context if it doesn't exist.
   *
   * @param propertyName The name of the property to retrieve or create a context for.
   *
   * @returns The value context associated with the specified property.
   *
   * @template T The type of value to be stored in the context.
   */
  private getOrCreateValueContext<T>(propertyName: string): ValueContext<T> {
    let valueContext = this.context.get(propertyName);
    if (!valueContext) {
      valueContext = new ValueContext<T>();
      this.context.set(propertyName, valueContext);
    }
    return valueContext;
  }
}
