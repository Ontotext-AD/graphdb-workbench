/**
 * Represents a map between prefixes and their corresponding URIs.
 */
export class NamespaceMap {
  private namespaces!: Record<string, string>;

  constructor(namespaces: Record<string, string>) {
    this.setNamespaces(namespaces);
  }

  setNamespaces(namespaces: Record<string, string>): void {
    this.namespaces = namespaces;
  }

  /**
   * Retrieves the URI for a given prefix.
   * @param prefix - The prefix for which to retrieve the URI.
   */
  getByPrefix(prefix: string): string {
    return this.namespaces[prefix] || '';
  }
}
