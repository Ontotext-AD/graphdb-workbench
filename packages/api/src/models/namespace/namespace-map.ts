/**
 * Represents a map between prefixes and their corresponding URIs.
 */
export class NamespaceMap {

  constructor(readonly namespaces: Record<string, string>) {
  }

  /**
   * Retrieves the URI for a given prefix.
   * @param prefix - The prefix for which to retrieve the URI.
   * @returns The corresponding URI, or an empty string if the prefix is not found.
   */
  getByPrefix(prefix: string): string {
    return this.namespaces[prefix] || '';
  }
}
