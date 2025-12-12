import {ObjectUtil} from '../object-util';

describe('ObjectUtil', () => {

  const obj1 = {a: 1, b: {c: [1, 2, 3], d: {e: 'hello'}}};
  const obj2 = {a: 1, b: {c: [1, 2, 3], d: {e: 'hello'}}};
  const obj3 = {a: 1, b: {c: [1, 2, 3, 4], d: {e: 'hello'}}};

  test('deepEqual should return false if the first object is null', () => {
    expect(ObjectUtil.deepEqual(null, obj1)).toBeFalsy();
  });

  test('deepEqual should return false if the first object is undefined', () => {
    expect(ObjectUtil.deepEqual(undefined, obj2)).toBeFalsy();
  });

  test('deepEqual should return false if the second object is null', () => {
    expect(ObjectUtil.deepEqual(obj1, null)).toBeFalsy();
  });

  test('deepEqual should return false if the second object is undefined', () => {
    expect(ObjectUtil.deepEqual(obj1, undefined)).toBeFalsy();
  });

  test('deepEqual should return false if objects have different constructors', () => {
    expect(ObjectUtil.deepEqual(new TestClass('a', 1), new AnotherTestClass('b'))).toBeFalsy();
  });

  test('deepEqual should return false if objects have arrays with different lengths', () => {
    expect(ObjectUtil.deepEqual(obj1, obj3)).toBeFalsy();
  });

  test('deepEqual should return false if objects have arrays with different objects in them', () => {
    const obj1 = {a: 1, b: {c: [{a: 2}], d: {e: 'hello'}}};
    const obj2 = {a: 1, b: {c: [{a: 3}], d: {e: 'hello'}}};
    expect(ObjectUtil.deepEqual(obj1, obj2)).toBeFalsy();
  });

  test('deepEqual should return false if objects have arrays with different object lengths in them', () => {
    const obj1 = {a: 1, b: {c: [{a: 2}], d: {e: 'hello'}}};
    const obj2 = {a: 1, b: {c: [{a: 2, b: 2}], d: {e: 'hello'}}};
    expect(ObjectUtil.deepEqual(obj1, obj2)).toBeFalsy();
  });

  test('deepEqual should return false if one value is an array and the other is not', () => {
    const arrayValue = [1, 2, 3];
    const nonArrayValue = {0: 1, 1: 2, 2: 3};
    expect(ObjectUtil.deepEqual(arrayValue, nonArrayValue)).toBeFalsy();
  });

  test('deepEqual should return false for different primitive values', () => {
    expect(ObjectUtil.deepEqual(5, 6)).toBeFalsy();
    expect(ObjectUtil.deepEqual('test', 'other')).toBeFalsy();
    expect(ObjectUtil.deepEqual(true, false)).toBeFalsy();
  });

  test('deepEqual should return true if objects share the same reference', () => {
    const obj2 = obj1;
    expect(ObjectUtil.deepEqual(obj1, obj2)).toBeTruthy();
    expect(obj1).toBe(obj2);
  });

  test('deepEqual should return true if objects are equal but have different references', () => {
    expect(ObjectUtil.deepEqual(obj1, obj2)).toBeTruthy();
    expect(obj1).not.toBe(obj2);
  });

  test('deepEqual should return true for strictly equal primitive values', () => {
    expect(ObjectUtil.deepEqual(5, 5)).toBeTruthy();
    expect(ObjectUtil.deepEqual('test', 'test')).toBeTruthy();
    expect(ObjectUtil.deepEqual(true, true)).toBeTruthy();
  });

  test('hasCopyMethod should return false when checking if primitives have a copy function', () => {
    expect(ObjectUtil.hasCopyMethod(3)).toBeFalsy();
    expect(ObjectUtil.hasCopyMethod('test')).toBeFalsy();
    expect(ObjectUtil.hasCopyMethod(true)).toBeFalsy();
  });

  test('hasCopyMethod should return false when checking a non-defined object', () => {
    expect(ObjectUtil.hasCopyMethod(undefined)).toBeFalsy();
    expect(ObjectUtil.hasCopyMethod(null)).toBeFalsy();
  });

  test('hasCopyMethod should return false when checking an object with a copy property that is not a function', () => {
    expect(ObjectUtil.hasCopyMethod({copy: [1111]})).toBeFalsy();
  });

  test('hasCopyMethod should return true when checking an object with a copy property that is a function', () => {
    expect(ObjectUtil.hasCopyMethod({
      copy: () => {
        // just function declaration
      }
    })).toBeTruthy();
  });

  describe('deepCopy - Primitives', () => {
    test('should return the same value for numbers', () => {
      expect(ObjectUtil.deepCopy(42)).toBe(42);
      expect(ObjectUtil.deepCopy(0)).toBe(0);
      expect(ObjectUtil.deepCopy(-99.5)).toBe(-99.5);
      expect(ObjectUtil.deepCopy(NaN)).toBeNaN();
      expect(ObjectUtil.deepCopy(Infinity)).toBe(Infinity);
    });

    test('should return the same value for strings', () => {
      expect(ObjectUtil.deepCopy('hello')).toBe('hello');
      expect(ObjectUtil.deepCopy('')).toBe('');
      expect(ObjectUtil.deepCopy('with\nnewlines')).toBe('with\nnewlines');
    });

    test('should return the same value for booleans', () => {
      expect(ObjectUtil.deepCopy(true)).toBe(true);
      expect(ObjectUtil.deepCopy(false)).toBe(false);
    });

    test('should return null for null', () => {
      expect(ObjectUtil.deepCopy(null)).toBeNull();
    });

    test('should return undefined for undefined', () => {
      expect(ObjectUtil.deepCopy(undefined)).toBeUndefined();
    });

    test('should return the same function reference', () => {
      const fn = () => 'test';
      expect(ObjectUtil.deepCopy(fn)).toBe(fn);
    });
  });

  describe('deepCopy - Arrays', () => {
    test('should create a deep copy of a simple array', () => {
      const arr = [1, 2, 3, 4, 5];
      const copy = ObjectUtil.deepCopy(arr) as number[];

      expect(copy).toEqual(arr);
      expect(copy).not.toBe(arr);
    });

    test('should create a deep copy of an empty array', () => {
      const arr: unknown[] = [];
      const copy = ObjectUtil.deepCopy(arr) as unknown[];

      expect(copy).toEqual([]);
      expect(copy).not.toBe(arr);
    });

    test('should create a deep copy of a nested array', () => {
      const arr = [1, [2, 3], [4, [5, 6]]];
      const copy = ObjectUtil.deepCopy(arr) as typeof arr;

      expect(copy).toEqual(arr);
      expect(copy).not.toBe(arr);
      expect(copy[1]).not.toBe(arr[1]);
      expect(copy[2]).not.toBe(arr[2]);
      expect((copy[2] as number[][])[1]).not.toBe((arr[2] as number[][])[1]);
    });

    test('should create a deep copy of an array with objects', () => {
      const arr = [{a: 1}, {b: 2}, {c: {d: 3}}];
      const copy = ObjectUtil.deepCopy(arr) as typeof arr;

      expect(copy).toEqual(arr);
      expect(copy).not.toBe(arr);
      expect(copy[0]).not.toBe(arr[0]);
      expect(copy[1]).not.toBe(arr[1]);
      expect(copy[2]).not.toBe(arr[2]);
      expect(copy[2].c).not.toBe(arr[2].c);
    });

    test('should create a deep copy of an array with mixed types', () => {
      const arr = [1, 'string', true, null, undefined, {key: 'value'}, [1, 2]];
      const copy = ObjectUtil.deepCopy(arr) as typeof arr;

      expect(copy).toEqual(arr);
      expect(copy).not.toBe(arr);
      expect(copy[5]).not.toBe(arr[5]);
      expect(copy[6]).not.toBe(arr[6]);
    });
  });

  describe('deepCopy - Plain Objects', () => {
    test('should create a deep copy of a simple object', () => {
      const obj = {name: 'John', age: 30, active: true};
      const copy = ObjectUtil.deepCopy(obj) as typeof obj;

      expect(copy).toEqual(obj);
      expect(copy).not.toBe(obj);
    });

    test('should create a deep copy of an empty object', () => {
      const obj = {};
      const copy = ObjectUtil.deepCopy(obj) as typeof obj;

      expect(copy).toEqual({});
      expect(copy).not.toBe(obj);
    });

    test('should create a deep copy of a deeply nested object', () => {
      const obj = {
        level1: {
          level2: {
            level3: {
              level4: {
                value: 'deep'
              }
            }
          }
        }
      };
      const copy = ObjectUtil.deepCopy(obj) as typeof obj;

      expect(copy).toEqual(obj);
      expect(copy).not.toBe(obj);
      expect(copy.level1).not.toBe(obj.level1);
      expect(copy.level1.level2).not.toBe(obj.level1.level2);
      expect(copy.level1.level2.level3).not.toBe(obj.level1.level2.level3);
      expect(copy.level1.level2.level3.level4).not.toBe(obj.level1.level2.level3.level4);
    });

    test('should create a deep copy of an object with array properties', () => {
      const obj = {
        numbers: [1, 2, 3],
        nested: {
          items: ['a', 'b', 'c']
        }
      };
      const copy = ObjectUtil.deepCopy(obj) as typeof obj;

      expect(copy).toEqual(obj);
      expect(copy).not.toBe(obj);
      expect(copy.numbers).not.toBe(obj.numbers);
      expect(copy.nested).not.toBe(obj.nested);
      expect(copy.nested.items).not.toBe(obj.nested.items);
    });

    test('should mutate copy without affecting original', () => {
      const original = {a: 1, b: {c: 2}};
      const copy = ObjectUtil.deepCopy(original) as typeof original;

      copy.a = 999;
      copy.b.c = 888;

      expect(original.a).toBe(1);
      expect(original.b.c).toBe(2);
      expect(copy.a).toBe(999);
      expect(copy.b.c).toBe(888);
    });
  });

  describe('deepCopy - Date Objects', () => {
    test('should create a deep copy of a Date object', () => {
      const date = new Date('2023-01-15T10:30:00Z');
      const copy = ObjectUtil.deepCopy(date) as Date;

      expect(copy).toEqual(date);
      expect(copy).not.toBe(date);
      expect(copy.getTime()).toBe(date.getTime());
    });

    test('should create independent Date copies', () => {
      const date = new Date('2023-01-15T10:30:00Z');
      const copy = ObjectUtil.deepCopy(date) as Date;

      copy.setFullYear(2024);

      expect(date.getFullYear()).toBe(2023);
      expect(copy.getFullYear()).toBe(2024);
    });

    test('should handle Date objects in nested structures', () => {
      const obj = {
        created: new Date('2023-01-01'),
        updated: new Date('2023-12-31'),
        nested: {
          timestamp: new Date('2023-06-15')
        }
      };
      const copy = ObjectUtil.deepCopy(obj) as typeof obj;

      expect(copy).toEqual(obj);
      expect(copy.created).not.toBe(obj.created);
      expect(copy.updated).not.toBe(obj.updated);
      expect(copy.nested.timestamp).not.toBe(obj.nested.timestamp);
    });
  });

  describe('deepCopy - RegExp Objects', () => {
    test('should create a deep copy of a RegExp with pattern only', () => {
      const regex = /test/;
      const copy = ObjectUtil.deepCopy(regex) as RegExp;

      expect(copy.source).toBe(regex.source);
      expect(copy.flags).toBe(regex.flags);
      expect(copy).not.toBe(regex);
    });

    test('should create a deep copy of a RegExp with flags', () => {
      const regex = /test/gi;
      const copy = ObjectUtil.deepCopy(regex) as RegExp;

      expect(copy.source).toBe('test');
      expect(copy.flags).toBe('gi');
      expect(copy.global).toBe(true);
      expect(copy.ignoreCase).toBe(true);
      expect(copy).not.toBe(regex);
    });

    test('should create a deep copy of a RegExp with all flags', () => {
      const regex = /pattern/gimsu;
      const copy = ObjectUtil.deepCopy(regex) as RegExp;

      expect(copy.source).toBe('pattern');
      expect(copy.flags).toBe('gimsu');
      expect(copy).not.toBe(regex);
    });

    test('should handle RegExp objects in nested structures', () => {
      const obj = {
        emailPattern: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
        nested: {
          urlPattern: /https?:\/\/.+/i
        }
      };
      const copy = ObjectUtil.deepCopy(obj) as typeof obj;

      expect(copy.emailPattern.source).toBe(obj.emailPattern.source);
      expect(copy.emailPattern).not.toBe(obj.emailPattern);
      expect(copy.nested.urlPattern).not.toBe(obj.nested.urlPattern);
    });
  });

  describe('deepCopy - Map Objects', () => {
    test('should create a deep copy of a Map with primitive values', () => {
      const map = new Map<string | number, string>([
        ['key1', 'value1'],
        ['key2', 'value2'],
        [3, 'value3']
      ]);
      const copy = ObjectUtil.deepCopy(map) as Map<string | number, string>;

      expect(copy.size).toBe(map.size);
      expect(copy.get('key1')).toBe('value1');
      expect(copy.get('key2')).toBe('value2');
      expect(copy.get(3)).toBe('value3');
      expect(copy).not.toBe(map);
    });

    test('should create a deep copy of a Map with object values', () => {
      const map = new Map([
        ['user1', {name: 'John', age: 30}],
        ['user2', {name: 'Jane', age: 25}]
      ]);
      const copy = ObjectUtil.deepCopy(map) as Map<string, {name: string; age: number}>;

      expect(copy.size).toBe(map.size);
      expect(copy.get('user1')).toEqual(map.get('user1'));
      expect(copy.get('user1')).not.toBe(map.get('user1'));
      expect(copy.get('user2')).not.toBe(map.get('user2'));
    });

    test('should create a deep copy of an empty Map', () => {
      const map = new Map();
      const copy = ObjectUtil.deepCopy(map) as Map<unknown, unknown>;

      expect(copy.size).toBe(0);
      expect(copy).not.toBe(map);
    });

    test('should create independent Map copies', () => {
      const map = new Map([['key', {value: 1}]]);
      const copy = ObjectUtil.deepCopy(map) as Map<string, {value: number}>;

      copy.get('key')!.value = 999;

      expect(map.get('key')!.value).toBe(1);
      expect(copy.get('key')!.value).toBe(999);
    });

    test('should handle Map with complex nested keys and values', () => {
      const map = new Map([
        [{id: 1}, {data: [1, 2, 3]}],
        [{id: 2}, {data: [4, 5, 6]}]
      ]);
      const copy = ObjectUtil.deepCopy(map) as Map<{id: number}, {data: number[]}>;

      const entries = Array.from(copy.entries());
      const originalEntries = Array.from(map.entries());

      expect(entries[0][0]).toEqual(originalEntries[0][0]);
      expect(entries[0][0]).not.toBe(originalEntries[0][0]);
      expect(entries[0][1]).not.toBe(originalEntries[0][1]);
      expect(entries[0][1].data).not.toBe(originalEntries[0][1].data);
    });
  });

  describe('deepCopy - Set Objects', () => {
    test('should create a deep copy of a Set with primitive values', () => {
      const set = new Set([1, 2, 3, 4, 5]);
      const copy = ObjectUtil.deepCopy(set) as Set<number>;

      expect(copy.size).toBe(set.size);
      expect(copy.has(1)).toBe(true);
      expect(copy.has(5)).toBe(true);
      expect(copy).not.toBe(set);
    });

    test('should create a deep copy of a Set with object values', () => {
      const set = new Set([
        {id: 1, name: 'First'},
        {id: 2, name: 'Second'}
      ]);
      const copy = ObjectUtil.deepCopy(set) as Set<{id: number; name: string}>;

      expect(copy.size).toBe(set.size);
      const copyArray = Array.from(copy);
      const setArray = Array.from(set);
      expect(copyArray[0]).toEqual(setArray[0]);
      expect(copyArray[0]).not.toBe(setArray[0]);
      expect(copyArray[1]).not.toBe(setArray[1]);
    });

    test('should create a deep copy of an empty Set', () => {
      const set = new Set();
      const copy = ObjectUtil.deepCopy(set) as Set<unknown>;

      expect(copy.size).toBe(0);
      expect(copy).not.toBe(set);
    });

    test('should create independent Set copies', () => {
      const set = new Set([{value: 1}, {value: 2}]);
      const copy = ObjectUtil.deepCopy(set) as Set<{value: number}>;

      const copyArray = Array.from(copy);
      copyArray[0].value = 999;

      const setArray = Array.from(set);
      expect(setArray[0].value).toBe(1);
      expect(copyArray[0].value).toBe(999);
    });

    test('should handle Set with nested arrays', () => {
      const set = new Set([[1, 2], [3, 4], [5, 6]]);
      const copy = ObjectUtil.deepCopy(set) as Set<number[]>;

      const copyArray = Array.from(copy);
      const setArray = Array.from(set);

      expect(copyArray[0]).toEqual(setArray[0]);
      expect(copyArray[0]).not.toBe(setArray[0]);
    });
  });

  describe('deepCopy - Custom Copy Method', () => {
    test('should use custom copy method if available', () => {
      const objWithCopy = {
        value: 42,
        nested: {data: 'test'},
        copy() {
          return {
            value: this.value * 2,
            nested: {data: this.nested.data + '_copied'},
            copy: this.copy
          };
        }
      };

      const copy = ObjectUtil.deepCopy(objWithCopy) as typeof objWithCopy;

      expect(copy.value).toBe(84);
      expect(copy.nested.data).toBe('test_copied');
      expect(copy).not.toBe(objWithCopy);
    });

    test('should prioritize custom copy method over default deep copy', () => {
      let copyMethodCalled = false;
      const objWithCopy = {
        data: [1, 2, 3],
        copy() {
          copyMethodCalled = true;
          return {data: [...this.data, 4], copy: this.copy};
        }
      };

      const copy = ObjectUtil.deepCopy(objWithCopy) as {data: number[]};

      expect(copyMethodCalled).toBe(true);
      expect(copy.data).toEqual([1, 2, 3, 4]);
    });
  });

  describe('deepCopy - Complex Nested Structures', () => {
    test('should handle objects with all types mixed', () => {
      const complex = {
        string: 'text',
        number: 123,
        boolean: true,
        nullValue: null,
        undefinedValue: undefined,
        array: [1, 2, {nested: 'value'}],
        object: {key: 'value', deep: {deeper: 'data'}},
        date: new Date('2023-01-01'),
        regex: /test/gi,
        map: new Map([['key', 'value']]),
        set: new Set([1, 2, 3])
      };

      const copy = ObjectUtil.deepCopy(complex) as typeof complex;

      expect(copy).toEqual(complex);
      expect(copy).not.toBe(complex);
      expect(copy.array).not.toBe(complex.array);
      expect(copy.array[2]).not.toBe(complex.array[2]);
      expect(copy.object).not.toBe(complex.object);
      expect(copy.object.deep).not.toBe(complex.object.deep);
      expect(copy.date).not.toBe(complex.date);
      expect(copy.regex).not.toBe(complex.regex);
      expect(copy.map).not.toBe(complex.map);
      expect(copy.set).not.toBe(complex.set);
    });

    test('should handle arrays containing all types', () => {
      const arr = [
        'string',
        123,
        true,
        null,
        undefined,
        {key: 'value'},
        [1, 2, 3],
        new Date('2023-01-01'),
        /pattern/,
        new Map([['key', 'value']]),
        new Set([1, 2, 3])
      ];

      const copy = ObjectUtil.deepCopy(arr) as typeof arr;

      expect(copy).toEqual(arr);
      expect(copy).not.toBe(arr);
      expect(copy[5]).not.toBe(arr[5]);
      expect(copy[6]).not.toBe(arr[6]);
      expect(copy[7]).not.toBe(arr[7]);
      expect(copy[8]).not.toBe(arr[8]);
      expect(copy[9]).not.toBe(arr[9]);
      expect(copy[10]).not.toBe(arr[10]);
    });

    test('should handle objects with prototype chain', () => {
      class BaseClass {
        baseValue = 'base';
      }

      class DerivedClass extends BaseClass {
        derivedValue = 'derived';
        nestedObj = {data: 'test'};
      }

      const instance = new DerivedClass();
      const copy = ObjectUtil.deepCopy(instance) as DerivedClass;

      expect(copy.baseValue).toBe('base');
      expect(copy.derivedValue).toBe('derived');
      expect(copy.nestedObj).toEqual({data: 'test'});
      expect(copy.nestedObj).not.toBe(instance.nestedObj);
      expect(Object.getPrototypeOf(copy)).toBe(Object.getPrototypeOf(instance));
    });
  });

  describe('deepCopy - Edge Cases', () => {
    test('should handle objects with numeric keys', () => {
      const obj = {0: 'zero', 1: 'one', 2: 'two'};
      const copy = ObjectUtil.deepCopy(obj) as typeof obj;

      expect(copy).toEqual(obj);
      expect(copy).not.toBe(obj);
    });

    test('should handle objects with symbol keys', () => {
      const sym = Symbol('test');
      const obj = {[sym]: 'symbol value', regular: 'regular value'};
      const copy = ObjectUtil.deepCopy(obj) as typeof obj;

      // Note: Object.keys doesn't include symbols, so they won't be copied
      expect(copy.regular).toBe('regular value');
      expect(copy).not.toBe(obj);
    });

    test('should handle very deeply nested structures', () => {
      let deep: Record<string, unknown> = {value: 'end'};
      for (let i = 0; i < 50; i++) {
        deep = {level: i, next: deep};
      }

      const copy = ObjectUtil.deepCopy(deep) as typeof deep;

      expect(copy).toEqual(deep);
      expect(copy).not.toBe(deep);
      expect((copy.next as typeof deep)).not.toBe(deep.next);
    });

    test('should handle objects with getter/setter properties', () => {
      const obj = {
        _value: 10,
        get value() { return this._value; },
        set value(val) { this._value = val; }
      };

      const copy = ObjectUtil.deepCopy(obj) as {_value: number};

      // Only enumerable own properties are copied
      expect(copy._value).toBe(10);
    });
  });

  test('isNullOrUndefined should return true for null values', () => {
    expect(ObjectUtil.isNullOrUndefined(null)).toBeTruthy();
  });

  test('isNullOrUndefined should return true for undefined values', () => {
    expect(ObjectUtil.isNullOrUndefined(undefined)).toBeTruthy();
  });

  test('isNullOrUndefined should return false for truthy values', () => {
    expect(ObjectUtil.isNullOrUndefined(1)).toBeFalsy();
    expect(ObjectUtil.isNullOrUndefined('test')).toBeFalsy();
    expect(ObjectUtil.isNullOrUndefined(true)).toBeFalsy();
    expect(ObjectUtil.isNullOrUndefined([])).toBeFalsy();
    expect(ObjectUtil.isNullOrUndefined({})).toBeFalsy();
  });

  test('isNullOrUndefined should return false for falsy values that are not null or undefined', () => {
    expect(ObjectUtil.isNullOrUndefined(0)).toBeFalsy();
    expect(ObjectUtil.isNullOrUndefined('')).toBeFalsy();
    expect(ObjectUtil.isNullOrUndefined(false)).toBeFalsy();
  });
});

class TestClass {
  prop1: string;
  prop2: number;

  constructor(prop1: string, prop2: number) {
    this.prop1 = prop1;
    this.prop2 = prop2;
  }
}

class AnotherTestClass {
  propA: string;

  constructor(propA: string) {
    this.propA = propA;
  }
}
