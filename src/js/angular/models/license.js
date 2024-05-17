export class License {

    constructor(license) {
        this.expiryDate = license.expiryDate || null;
        this.latestPublicationDate = license.latestPublicationDate || null;
        this.licenseCapabilities = license.licenseCapabilities || null;
        this.licensee = license.licensee || null;
        this.maxCpuCores = license.maxCpuCores || null;
        this.message = license.message || null;
        this.product = license.product || null;
        this.productType = license.productType || null;
        this.typeOfUse = license.typeOfUse || null;
        this.valid = license.valid || null;
        this.version = license.version || null;
    }
}
