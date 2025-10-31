/**
 * Enum representing different product types for licensing.
 */
export enum Product {
  GRAPHDB_LITE = 'GRAPHDB_LITE',
  GRAPHDB_SE = 'GRAPHDB_SE',
  GRAPHDB_ENTERPRISE = 'GRAPHDB_ENTERPRISE',
  GRAPHDB_SANDBOX = 'GRAPHDB_SANDBOX',
}

export function toProduct(value: string): Product | undefined {
  return Object.values(Product).find((p) => p === value);
}
