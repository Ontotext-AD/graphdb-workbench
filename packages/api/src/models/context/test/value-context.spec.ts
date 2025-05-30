import { ValueContext } from '../value-context';
import { ObjectUtil } from '../../../services/utils';
import {Copyable} from '../../common';

describe('ValueContext', () => {
  let valueContext: ValueContext<number>;
  let callback: jest.Mock;

  beforeEach(() => {
    valueContext = new ValueContext<number>();
    callback = jest.fn();
  });

  it('should set and get value correctly', () => {
    valueContext.setValue(42);
    expect(valueContext.getValue()).toBe(42);
  });

  it('setValue should not update value if it is the same', () => {
    jest.spyOn(ObjectUtil, 'deepEqual').mockReturnValue(true);
    valueContext.setValue(42);
    valueContext.setValue(42);
    expect(callback).not.toHaveBeenCalled();
  });

  it('subscribe should update value and notify subscribers if value changes', () => {
    jest.spyOn(ObjectUtil, 'deepEqual').mockReturnValue(false);
    valueContext.subscribe(callback);
    valueContext.setValue(42);
    expect(callback).toHaveBeenCalledWith(42);
  });

  it('setValue should return a deep copy of the value if it is an object', () => {
    const obj = { a: 1 };
    jest.spyOn(ObjectUtil, 'deepCopy').mockReturnValue({ a: 1 });
    valueContext.setValue(obj as unknown as number);
    expect(valueContext.getValue()).toEqual({ a: 1 });
  });

  it('setValue should return undefined if value is null', () => {
    valueContext.setValue(5);
    expect(valueContext.getValue()).toBe(5);

    valueContext.setValue(null as unknown as number);
    expect(valueContext.getValue()).toBeUndefined();
  });

  it('should unsubscribe callback correctly', () => {
    const unsubscribe = valueContext.subscribe(callback);
    unsubscribe();
    valueContext.setValue(42);
    expect(callback).not.toHaveBeenCalled();
  });

  it('should return a deep copy of the value if it has a copy method', () => {
    class CopyableValue implements Copyable<CopyableValue> {
      constructor(public a: number) {}
      copy(): CopyableValue {
        return new CopyableValue(this.a);
      }
    }
    const copyableValueContext = new ValueContext<CopyableValue>();
    const copyableValue = new CopyableValue(1);
    jest.spyOn(copyableValue, 'copy');

    copyableValueContext.setValue(copyableValue);
    const result = copyableValueContext.getValue();
    expect(result?.a).toEqual(copyableValue.a);
    // Ensure it's a copy, not the same instance
    expect(result).not.toBe(copyableValue);
    expect(copyableValue.copy).toHaveBeenCalled();
  });

  it('canUpdate should return true when no validation promises are set', async () => {
    // First test: validation that returns false
    const valueContext = new ValueContext<number>();

    // Setting a value should fail and return false
    const result = await valueContext.canUpdate(42);
    expect(result).toBe(true);
  });

  it('canUpdate should return true when all validation promises resolve to true', async () => {
    // Create multiple validation promises that all return true
    const validation1 = jest.fn().mockImplementation(() => Promise.resolve(true));
    const validation2 = jest.fn().mockImplementation(() => Promise.resolve(true));

    // Subscribe with multiple validations
    valueContext.subscribe(callback, validation1);
    valueContext.subscribe(callback, validation2);

    // Setting a value should return true
    const result = await valueContext.canUpdate(42);

    // Verify all validations were called
    expect(validation1).toHaveBeenCalledWith(42);
    expect(validation2).toHaveBeenCalledWith(42);

    // Verify the value was updated and callback was called
    expect(result).toBe(true);
  });

  it('canUpdate should return false when some validation promises resolve to false', async () => {
    // Create multiple validation promises where one resolves to false
    const validation1 = jest.fn().mockImplementation(() => Promise.resolve(true));
    const validation2 = jest.fn().mockImplementation(() => Promise.resolve(false));

    // Subscribe with multiple validations
    valueContext.subscribe(callback, validation1);
    valueContext.subscribe(callback, validation2);

    // Setting a value should return false
    const result = await valueContext.canUpdate(42);

    // Verify all validations were called
    expect(validation1).toHaveBeenCalledWith(42);
    expect(validation2).toHaveBeenCalledWith(42);

    // Verify the value was not updated and callback was not called
    expect(result).toBe(false);
  });

  it('canUpdate should return false when some validation promises rejects', async () => {
    // Create multiple validation promises where one rejects
    const validation1 = jest.fn().mockImplementation(() => Promise.resolve(true));
    const validation2 = jest.fn().mockImplementation(() => Promise.reject());

    // Subscribe with multiple validations
    valueContext.subscribe(callback, validation1);
    valueContext.subscribe(callback, validation2);

    // Setting a value should return false
    const result = await valueContext.canUpdate(42);

    // Verify all validations were called
    expect(validation1).toHaveBeenCalledWith(42);
    expect(validation2).toHaveBeenCalledWith(42);

    // Verify the value was not updated and callback was not called
    expect(result).toBe(false);
  });

  it('should call afterChangeCallback after the main callback', () => {
    const value = 123;
    const callOrder: string[] = [];

    const mainCallback = jest.fn(() => callOrder.push('main'));
    const afterCallback = jest.fn(() => callOrder.push('after'));

    valueContext.subscribe(mainCallback, undefined, afterCallback);

    jest.spyOn(ObjectUtil, 'deepEqual').mockReturnValue(false);

    valueContext.setValue(value);

    expect(mainCallback).toHaveBeenCalledWith(value);
    expect(afterCallback).toHaveBeenCalledWith(value);
    expect(callOrder).toEqual(['main', 'after']);
  });

});
