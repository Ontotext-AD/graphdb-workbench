import {SimilarityIndexType} from "./similarity-index-type";
import {SimilarityIndexStatus} from "./similarity-index-status";

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

    isTextType() {
        return SimilarityIndexType.isTextType(this.type);
    }

    isTextLiteralType() {
        return SimilarityIndexType.isTextLiteralType(this.type);
    }

    isPredicationType() {
        return SimilarityIndexType.isPredicationType(this.type);
    }

    isCreatingStatus() {
        return SimilarityIndexStatus.isCreatingStatus(this.status);
    }

    isBuildingStatus() {
        return SimilarityIndexStatus.isBuildingStatus(this.status);
    }

    isBuiltStatus() {
        return SimilarityIndexStatus.isBuiltStatus(this.status);
    }

    isRebuildingStatus() {
        return SimilarityIndexStatus.isRebuildingStatus(this.status);
    }

    isOutdatedStatus() {
        return SimilarityIndexStatus.isOutdatedStatus(this.status);
    }

    isInterruptedStatus() {
        return SimilarityIndexStatus.isInterruptedStatus(this.status);
    }

    isObsoleteStatus() {
        return SimilarityIndexStatus.isObsoleteStatus(this.status);
    }

    isFailedStatus() {
        return SimilarityIndexStatus.isFailedStatus(this.status);
    }
}
