import {ValueContext} from '../../models/context/value-context';
import {ValueChangeCallback} from '../../models/context/value-change-callback';
import {Service} from '../../providers/service/service';

/**
 * Abstract service that manages the context for various properties and allows for value retrieval, updates
 * and subscriptions to value changes.
 * The service is generic and requires a type parameter that defines the fields that the service can handle.
 * The fields are defined as properties of the service class and are used to access the context values.
 */
export abstract class ContextService<TFields extends Record<string, unknown>> implements Service {
  /**
   * A map that stores the context for each property, keyed by property name.
   * The context holds the value and the list of subscribers (callback functions).
   */
  // eslint-disable-next-line @typescript-eslint/consistent-generic-constructors, @typescript-eslint/no-explicit-any
  protected context: Map<string, ValueContext<any>> = new Map();

  /**
   * Updates the value of a specific property.
   *
   * @param propertyName The name of the property to be updated.
   * @param value The new value to be assigned to the property.
   *
   * @template T The type of the value to be set.
   */
  updateContextProperty<T>(propertyName: string, value: T): void {
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

  /**
   * Finds out if particular implementation of the ContextService contains a field with the given name. This can be used
   * to determine if the service can handle a specific field.
   * This method uses the keys of the TFields type to check if the field exists because all fields that the service can
   * handle are defined in the TFields type.
   * @param fieldName The name of the field to check.
   */
  canHandle(fieldName: string): boolean {
    // Iterate over all keys of TFields
    for (const key in this as unknown as TFields) {
      if ((this as never)[key] === fieldName) {
        return true;
      }
    }
    return false;
  }
}
