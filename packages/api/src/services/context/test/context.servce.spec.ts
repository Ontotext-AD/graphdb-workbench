import {ContextService} from '../context.service';
import {DeriveContextServiceContract} from '../../../models/context/update-context-method';

describe('ContextService', () => {
  let contextService: TestContextService;

  beforeEach(() => {
    contextService = new TestContextService();
  });

  test('the callback function should be called immediately when it is registered with the last value of the property', () => {
    const valueOfTestProperty = {a: 1, b: [1, 2]};
    const propertyName = 'testProperty';

    // Given the property is updated before the callback function is registered
    contextService.updateProperty(propertyName, valueOfTestProperty);

    // When a callback function is subscribed
    const callBackFunction = jest.fn();
    contextService.subscribeToProperty(propertyName, callBackFunction);

    // Then the callback function should be called with the last value
    expect(callBackFunction).toHaveBeenLastCalledWith(valueOfTestProperty);
  });

  test('getProperty should return the current value in the context', () => {
    const valueOfTestProperty = {a: 1, b: [1, 2]};
    const propertyName = 'testProperty';

    // When the property is updated
    contextService.updateProperty(propertyName, valueOfTestProperty);

    // Then the context should return a copy of the new value
    const propertyValue = contextService.getProperty(propertyName);
    expect(propertyValue).toEqual(valueOfTestProperty);
    expect(propertyValue).not.toBe(valueOfTestProperty);
  });

  test('ContextService should continue calling other callback functions if one is unsubscribed', () => {
    const valueOfTestProperty = {a: 1, b: [1, 2]};
    const propertyName = 'testProperty';

    const firstCallBackFunction = jest.fn();
    const secondCallBackFunction = jest.fn();

    // Given two subscribed functions for 'testProperty' changes
    const unsubscribeFunction = contextService.subscribeToProperty(propertyName, firstCallBackFunction);
    contextService.subscribeToProperty(propertyName, secondCallBackFunction);

    // Clear previous mock calls for clean state
    firstCallBackFunction.mockClear();
    secondCallBackFunction.mockClear();

    // When one function is unsubscribed
    unsubscribeFunction();
    // and the property is updated
    contextService.updateProperty(propertyName, valueOfTestProperty);

    // Then only the unsubscribed function should not be called
    expect(firstCallBackFunction).toHaveBeenCalledTimes(0);
    expect(secondCallBackFunction).toHaveBeenCalledTimes(1);
  });

  test('ContextService should call all callback functions with the changed value', () => {
    const valueOfTestProperty = {a: 1, b: [1, 2]};
    const propertyName = 'testProperty';

    const firstCallBackFunction = jest.fn();
    const secondCallBackFunction = jest.fn();

    // Given two subscribed functions for 'testProperty' changes
    contextService.subscribeToProperty(propertyName, firstCallBackFunction);
    contextService.subscribeToProperty(propertyName, secondCallBackFunction);

    // When the property is updated
    contextService.updateProperty(propertyName, valueOfTestProperty);

    // Then both callback functions should be called with the value of the property
    expect(firstCallBackFunction).toHaveBeenLastCalledWith(valueOfTestProperty);
    expect(secondCallBackFunction).toHaveBeenLastCalledWith(valueOfTestProperty);
  });

  test('ContextService should call each callback function with its own copy of the value', () => {
    const valueOfTestProperty = {a: 1, b: [1, 2]};
    const propertyName = 'testProperty';

    const firstCallBackFunction = jest.fn();
    const secondCallBackFunction = jest.fn();

    // Given two subscribed functions for 'testProperty' changes
    contextService.subscribeToProperty(propertyName, firstCallBackFunction);
    contextService.subscribeToProperty(propertyName, secondCallBackFunction);

    // When the property is updated
    contextService.updateProperty(propertyName, valueOfTestProperty);

    // Then both callback functions should be called with their own copy of the value
    expect(firstCallBackFunction.mock.lastCall[0]).not.toBe(valueOfTestProperty);
    expect(secondCallBackFunction.mock.lastCall[0]).not.toBe(valueOfTestProperty);
    expect(firstCallBackFunction.mock.lastCall[0]).not.toBe(secondCallBackFunction.mock.lastCall[0]);
  });

  it('canHandle should return false if the field name is not handled', () => {
    const result = contextService.canHandle('nonExistentField');
    expect(result).toBe(false);
  });
});

type TestContextFields = {
  readonly TEST_PROPERTY: 'testProperty';
}

type TestContextFieldParams = {
  readonly TEST_PROPERTY: string;
}

// Expose protected methods for testing
class TestContextService extends ContextService<TestContextFields> implements DeriveContextServiceContract<TestContextFields, TestContextFieldParams> {
  readonly TEST_PROPERTY = 'testProperty';

  updateTestProperty(value: string): void {
    this.updateContextProperty(this.TEST_PROPERTY, value);
  }

  public updateProperty<T>(propertyName: string, value: T): void {
    this.updateContextProperty(propertyName, value);
  }

  public getProperty<T>(propertyName: string): T | undefined {
    return this.getContextPropertyValue(propertyName);
  }

  public subscribeToProperty<T>(propertyName: string, callback: (value?: T) => void): () => void {
    return this.subscribe(propertyName, callback);
  }
}
