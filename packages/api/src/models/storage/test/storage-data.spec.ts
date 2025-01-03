import { StorageData } from '../storage-data';

describe('StorageData', () => {
  test('getValue should return the value', () => {
    const storageData = new StorageData('testValue');
    expect(storageData.getValue()).toBe('testValue');
  });

  test('getValue should return null if the value is null', () => {
    const storageData = new StorageData(null);
    expect(storageData.getValue()).toBeNull();
  });

  test('getValueOrDefault should return the value if it is not null', () => {
    const storageData = new StorageData('testValue');
    expect(storageData.getValueOrDefault('defaultValue')).toBe('testValue');
  });

  test('getValueOrDefault should return the default value if the value is null', () => {
    const storageData = new StorageData(null);
    expect(storageData.getValueOrDefault('defaultValue')).toBe('defaultValue');
  });

  test('getAsJson should return the value as a JSON object', () => {
    const jsonValue = { key: 'value' };
    const storageData = new StorageData(JSON.stringify(jsonValue));
    expect(storageData.getAsJson()).toStrictEqual(jsonValue);
  });

  test('getAsJson should return null if the value is not a valid JSON', () => {
    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {
      // Do nothing
    });
    const storageData = new StorageData('invalidJson');
    expect(storageData.getAsJson()).toBeNull();
    consoleErrorMock.mockRestore();
  });

  test('getAsJson should return null if the value is null', () => {
    const storageData = new StorageData(null);
    expect(storageData.getAsJson()).toBeNull();
  });
});
