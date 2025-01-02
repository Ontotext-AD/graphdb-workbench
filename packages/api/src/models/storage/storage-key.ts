/**
 * A utility class for generating storage keys by prefixing them with a namespace.
 */
export class StorageKey {
  static readonly namespace: string = 'ontotext.gdb.';

  /**
   * Prefixes the given key with the namespace.
   * @param key The key to prefix.
   * @returns The prefixed key.
   */
  static prefix(key: string): string {
    if (!key) {
      throw new Error('Key must be a non-empty string');
    }
    return StorageKey.namespace + key;
  }
}
