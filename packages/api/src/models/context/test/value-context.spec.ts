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

    const copyableValue = new CopyableValue(1);
    valueContext.setValue(copyableValue as unknown as number);
    const result = valueContext.getValue() as unknown as CopyableValue;
    expect(result).toEqual(copyableValue);
    // Ensure it's a copy, not the same instance
    expect(result).not.toBe(copyableValue);
  });
});
