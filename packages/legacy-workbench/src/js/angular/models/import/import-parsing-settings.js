export class ImportParsingSettings {
    constructor() {
        /**
         * The property is used when importing JSONLD files only
         * @type {string | undefined}
         */
        this.contextLink = undefined;
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
