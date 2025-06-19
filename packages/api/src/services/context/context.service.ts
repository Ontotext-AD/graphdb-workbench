import {ValueContext} from '../../models/context/value-context';
import {ValueChangeCallback} from '../../models/context/value-change-callback';
import {Service} from '../../providers/service/service';
import {BeforeChangeValidationPromise} from '../../models/context/before-change-validation-promise';
import {ContextSubscriptionManager} from './context-subscription-manager';
import {ServiceProvider} from '../../providers';
import {Subscription} from '../../models/common/subscription';
import {SubscriptionList} from '../../models/common';

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
  private _canSubscribeAll = false;

  /**
   * After construction, register this service with the global registry.
   */
  onCreated(): void {
    this._canSubscribeAll = true;
    ServiceProvider.get(ContextSubscriptionManager).subscribeToService(this);
  }

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
   * Checks if validation passes for a value of a specific property.
   *
   * @param propertyName The name of the property to be validated and updated.
   * @param value The new value to be validated and potentially assigned to the property.
   *
   * @returns A promise that resolves to a boolean indicating whether the validation passed.
   *
   * @template T The type of the value to be validated and set.
   */
  validatePropertyChange<T>(propertyName: string, value: T): Promise<boolean> {
    const valueContext = this.getOrCreateValueContext(propertyName);
    return valueContext.canUpdate(value);
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
   * Registers a <code>callbackFunction</code> function that will be called when the value of a property with <code>propertyName</code> changes.
   * It immediately calls the callback with the current value and then subscribes the callback for future changes to the property.
   *
   * @param propertyName The name of the property to subscribe to.
   * @param callbackFunction The callback function to be called when the property value changes.
   *                         It will receive the current value of the property as its argument.
   * @param beforeChangeValidationPromise Optional promise that can be used to validate the new value before it is set.
   *                                     If the promise resolves to false, the value change will be rejected.
   * @param afterChangeCallback - Optional function called **after** the main callback with the updated value.
   *
   * @returns A function that can be called to unsubscribe from the property updates.
   *
   * @template T The type of the value that the callback function will receive.
   */
  protected subscribe<T>(propertyName: string,
    callbackFunction: ValueChangeCallback<T | undefined>,
    beforeChangeValidationPromise?: BeforeChangeValidationPromise<T>,
    afterChangeCallback?: ValueChangeCallback<T | undefined>): () => void {

    if (callbackFunction) {
      // Call the callback immediately with the current value
      callbackFunction(this.getContextPropertyValue(propertyName));
    }
    if (afterChangeCallback) {
      afterChangeCallback(this.getContextPropertyValue(propertyName));
    }
    // Return the unsubscribe function from the context
    return this.getOrCreateValueContext<T>(propertyName).subscribe(callbackFunction, beforeChangeValidationPromise, afterChangeCallback);
  }

  /**
   * Subscribes globally to all fields defined in TFields.
   */
  public subscribeAll<T>(
    callbackFunction: ValueChangeCallback<T | undefined>,
    beforeChangeValidationPromise?: BeforeChangeValidationPromise<T>,
    afterChangeCallback?: ValueChangeCallback<T | undefined>
  ): Subscription {
    const unsubscribeFns: SubscriptionList = new SubscriptionList();
    // iterate through service-defined fields
    for (const key of this.getContextFields()) {
      unsubscribeFns.add(
        this.subscribe<T>(
          key,
          callbackFunction,
          beforeChangeValidationPromise,
          afterChangeCallback
        )
      );
    }
    return (): void => unsubscribeFns.unsubscribeAll();
  }
  
  /**
   * Retrieves the names of all context fields defined in the service,
   * which will be used to register change subscriptions.
   *
   * This method is part of the abstract base class for context services.
   * Each subclass defines a specific set of properties that are managed
   * through methods such as `updateProperty` and `onPropertyChanged`.
   *
   * This method generically collects all string-typed values defined in the subclass,
   * under the assumption that all such values represent valid context property names.
   * It assumes that:
   * - Subclasses will only define properties related to the context (i.e., no extra fields).
   * - These properties are managed entirely by the base service logic.
   *
   * While this design simplifies property management and change detection,
   * it is a known limitation that it does not strictly enforce property scoping.
   * It may inadvertently include properties that are not intended for context management
   * if subclasses define unrelated string values.
   *
   * **Note**: This approach is a temporary solution and will be deprecated once
   * all pages are migrated away from AngularJS. At that point, this generic behavior
   * will be replaced with more explicit and type-safe mechanisms.
   *
   * Subclasses may override this method if they wish to manually control
   * which context fields are exposed for subscription.
   *
   * @returns An array of property names (strings) to which change subscriptions should be applied.
   */
  protected getContextFields(): string[] {
    return Object.values(this).filter((value): value is string => typeof value === 'string');
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

  get canSubscribeAll(): boolean {
    return this._canSubscribeAll;
  }
}
