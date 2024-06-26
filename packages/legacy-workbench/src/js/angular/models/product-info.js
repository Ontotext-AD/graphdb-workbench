/**
 * Object that holds information about product: graphDB version, workbench version ...
 */
export class ProductInfo {
    constructor() {
        this.Workbench = '';
        this.connectors = [];
        this.productShortVersion = '';
        this.productType = '';
        this.productVersion = '';
        this.sesame = '';
    }
}
