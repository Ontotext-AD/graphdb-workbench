export class SimilarityIndex {
    constructor() {
        this.analyzer = '';
        this.infer = true;
        this.options = '';
        this.sameAs = true;
        this.searchQuery = '';
        this.selectQuery = '';
        this.stopList = undefined;
        this.name = '';

        /**
         * The similarity index type.
         *
         * @type {SimilarityIndexType}
         */
        this.type = undefined;

        /**
         * The similarity index type.
         *
         * @type {SimilarityIndexStatus}
         */
        this.status = undefined;

        this.analogicalQuery = undefined;

    }
}