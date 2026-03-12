export type MutableStorage = Storage & {
  _map: Map<string, string>;
};

export class StorageMock implements MutableStorage {
  _map: Map<string, string> = new Map<string, string>();

  get length(): number {
    return this._map.size;
  }

  clear(): void {
    this._map.clear();
  }

  key(index: number): string | null {
    return Array.from(this._map.keys())[index] ?? null;
  }

  getItem(key: string): string | null {
    return this._map.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this._map.set(key, value);
  }

  removeItem(key: string): void {
    this._map.delete(key);
  }
}

export function createMockStorage(): MutableStorage {
  return new StorageMock();
}
