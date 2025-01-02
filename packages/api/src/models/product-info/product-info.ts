export class ProductInfo {
  workbench: string;
  productType: string;
  productVersion: string;
  sesame: string;
  connectors: string;

  constructor(data: Partial<ProductInfo & { Workbench: string }>) {
    // The 'Workbench' property comes with an upper-case 'W' from the backend
    // Map it to lower-case for consistency
    this.workbench = data.Workbench || '';
    this.productType = data.productType || '';
    this.productVersion = data.productVersion || '';
    this.sesame = data.sesame || '';
    this.connectors = data.connectors || '';
  }
}
