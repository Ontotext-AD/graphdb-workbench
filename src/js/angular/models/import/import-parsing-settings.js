export class ImportParsingSettings {
    constructor() {
        this.preserveBNodeIds = false;
        this.failOnUnknownDataTypes = false;
        this.verifyDataTypeValues = false;
        this.normalizeDataTypeValues = false;
        this.failOnUnknownLanguageTags = false;
        this.verifyLanguageTags = false;
        this.normalizeLanguageTags = false;
        this.stopOnError = true;
    }
}
