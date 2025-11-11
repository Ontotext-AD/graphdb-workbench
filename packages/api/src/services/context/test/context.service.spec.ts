import {ContextService} from '../context.service';
import {DeriveContextServiceContract} from '../../../models/context/update-context-method';
import {BeforeChangeValidationPromise} from '../../../models/context/before-change-validation-promise';

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

  it('canHandle should return true if the field name is handled', () => {
    const result = contextService.canHandle('testProperty');
    expect(result).toBe(true);
  });

  test('Should validate a property successfully when validation returns true', async () => {
    const valueOfTestProperty = {a: 1, b: [1, 2]};
    const propertyName = 'testProperty';

    const callBackFunction = jest.fn();
    const validation = jest.fn().mockImplementation(() => Promise.resolve(true));
    contextService.subscribeToProperty(propertyName, callBackFunction, validation);

    // When validating a property
    const result = await contextService.validatePropertyChange(propertyName, valueOfTestProperty);

    // Then the result should be true
    expect(result).toBe(true);
    // And canUpdate should have been called with the value
    expect(validation).toHaveBeenCalledWith(valueOfTestProperty);
    // And callback should have been called once on initial subscription
    expect(callBackFunction).toHaveBeenCalledTimes(1);
  });

  test('Should not update a property when canUpdate returns false', async () => {
    const initialValue = {a: 1, b: [1, 2]};
    const newValue = {a: 3, b: [3, 3]};
    const propertyName = 'testProperty';

    const callBackFunction = jest.fn();
    const validation = jest.fn().mockImplementation(() => Promise.resolve(false));

    contextService.updateProperty(propertyName, initialValue);
    contextService.subscribeToProperty(propertyName, callBackFunction, validation);

    // When validating and updating a property
    const result = await contextService.validatePropertyChange(propertyName, newValue);

    // Then the result should be false
    expect(result).toBe(false);
    // And canUpdate should have been called with the value
    expect(validation).toHaveBeenCalledWith(newValue);
    // And callback should have been called once on initial subscription
    expect(callBackFunction).toHaveBeenCalledTimes(1);
  });

  test('ContextService should call afterChangeCallback after the main callback with the same value', () => {
    const valueOfTestProperty = {a: 1, b: [1, 2]};
    const propertyName = 'testProperty';

    const callSequence: string[] = [];

    const mainCallback = jest.fn(() => callSequence.push('main'));
    const afterCallback = jest.fn(() => callSequence.push('after'));

    contextService.subscribeToProperty(propertyName, mainCallback, undefined, afterCallback);

    callSequence.length = 0;
    contextService.updateProperty(propertyName, valueOfTestProperty);

    expect(mainCallback).toHaveBeenLastCalledWith(valueOfTestProperty);
    expect(afterCallback).toHaveBeenLastCalledWith(valueOfTestProperty);
    expect(callSequence).toEqual(['main', 'after']);
  });

  describe('ContextService.deserializeProperty', () => {
    it('should return the raw string when no deserialization mapping is provided', () => {
      const svc = new TestContextService();
      const raw = '"plain-string"';
      const result = svc.deserializeProperty('unknownKey', raw);
      expect(result).toBe(raw);
    });

    it('should create an instance of the mapped class using parsed JSON', () => {
      const svc = new TestContextServiceWithDeserialize();
      const payload = { foo: 'bar', n: 5 };
      const raw = JSON.stringify(payload);

      const result = svc.deserializeProperty('testProperty', raw);

      expect(result).toBeInstanceOf(DummyDto);
      const dto = result as DummyDto;
      expect(dto.data).toEqual(payload);
    });

    it('should throw when JSON is invalid for a mapped key', () => {
      const svc = new TestContextServiceWithDeserialize();
      // string values shouldn't be parsed as JSON
      expect(() => svc.deserializeProperty('testProperty', 'not-json')).toThrow();
    });

    it('should return the raw string for non-mapped key even if it looks like JSON', () => {
      const svc = new TestContextService();
      const raw = '{"looks":"like json"}';
      const result = svc.deserializeProperty('nonMapped', raw);
      expect(result).toBe(raw);
    });
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

  public subscribeToProperty<T>(
    propertyName: string,
    callback: (value?: T) => void,
    beforeChangeValidationPromise?: BeforeChangeValidationPromise<T>,
    afterChangeCallback?: (value?: T) => void
  ): () => void {
    return this.subscribe(propertyName, callback, beforeChangeValidationPromise, afterChangeCallback);
  }
}

// Helper DTO and test service to cover deserializeProperty
class DummyDto {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(public data: any) {}
}

class TestContextServiceWithDeserialize extends ContextService<TestContextFields> implements DeriveContextServiceContract<TestContextFields, TestContextFieldParams> {
  readonly TEST_PROPERTY = 'testProperty';
  updateTestProperty: (value: string) => void = () => undefined;

  protected getDeserializedContext(): Record<string, (storageValue: string) => unknown> | undefined {
    return {
      [this.TEST_PROPERTY]: (raw: string) => new DummyDto(JSON.parse(raw))
    };
  }
}
