export class ProductInfo {
  workbench: string;
  productType: string;
  productVersion: string;
  shortVersion?: string;
  sesame: string;
  connectors: string;

  constructor(data: Partial<ProductInfo>) {
    this.workbench = data.workbench ?? '';
    this.productType = data.productType ?? '';
    this.productVersion = data.productVersion ?? '';
    this.sesame = data.sesame ?? '';
    this.connectors = data.connectors ?? '';
    this.shortVersion = this.resolveShortVersion(data);
  }

  private resolveShortVersion(data: Partial<ProductInfo>) {
    const productVersion = data.productVersion;

    if (!productVersion) {
      return '';
    }

    // Extract major.minor version (e.g., "10.0" from "10.0.0-M3-RC1")
    const majorMinorRegex = /^(\d+\.\d+)/;
    const majorMinorMatch = majorMinorRegex.exec(productVersion);
    const baseVersion = majorMinorMatch?.[1] ?? productVersion;

    // Extract first attribute after dash (e.g., "M3" from "10.0.0-M3-RC1")
    const attributeRegex = /(-[^-]+)/;
    const attributeMatch = attributeRegex.exec(productVersion);
    const firstAttribute = attributeMatch?.[1] ?? '';

    return baseVersion + firstAttribute;
  }
}
