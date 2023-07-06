import {SimilaritySearchType} from "./similarity-search-type";

export class SimilaritySearch {
    constructor() {
        this.type = SimilaritySearchType.SEARCH_TERM;
        this.predicate = '';
        this.termOrSubject = '';
    }

    isSearchAnalogicalType() {
        return SimilaritySearchType.isSearchAnalogicalType(this.type);
    }

    isSearchTermType() {
        return SimilaritySearchType.isSearchTermType(this.type);
    }


    isSearchEntityType() {
        return SimilaritySearchType.isSearchEntityType(this.type);
    }

    isSearchEntityPredicateType() {
        return SimilaritySearchType.isSearchEntityPredicateType(this.type);
    }

    isSearchDocumentType(type) {
        return SimilaritySearchType.isSearchDocumentType(this.type);
    }
}
