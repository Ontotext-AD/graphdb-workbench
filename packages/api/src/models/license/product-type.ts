/**
 * Enum representing different product types for licensing.
 */
export enum ProductType {
  FREE = 'free',
  STANDARD = 'standard',
  ENTERPRISE = 'enterprise',
  SANDBOX = 'sandbox',
}

export function toProductType(value: string): ProductType | undefined {
  return Object.values(ProductType).find((p) => p === value);
}
