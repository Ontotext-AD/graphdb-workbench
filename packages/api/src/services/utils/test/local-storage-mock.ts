export type MutableStorage = Storage & {
  _map: Map<string, string>;
};

export function createMockStorage(): MutableStorage {
  const map = new Map<string, string>();
  return {
    _map: map,
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    key(index: number): string | null {
      return Array.from(map.keys())[index] ?? null;
    },
    getItem(key: string): string | null {
      return map.has(key) ? map.get(key)! : null;
    },
    setItem(key: string, value: string): void {
      map.set(key, value);
    },
    removeItem(key: string): void {
      map.delete(key);
    },
  } as unknown as MutableStorage;
}
