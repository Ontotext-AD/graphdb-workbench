import {ObjectUtil} from './object-util';
import {Repository} from '../../models/repositories';
import {RepositoryLocation} from '../../models/repository-location';

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
    expect(ObjectUtil.deepEqual(new Repository(), new RepositoryLocation())).toBeFalsy();
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

  test('deepCopy should create a deep copy of an object', () => {
    const obj2 = ObjectUtil.deepCopy(obj1) as typeof obj1;
    expect(obj1).toEqual(obj2);
    // Verify that the objects do not share the same reference
    expect(obj1).not.toBe(obj2);
    // Verify that the inner objects do not share the same reference
    expect(obj1.b).not.toBe(obj2.b);
  });
});
