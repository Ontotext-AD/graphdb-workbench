import {SimilaritySearchType} from "./similarity-search-type";

export class SimilaritySearch {
    constructor() {
        this.type = SimilaritySearchType.SEARCH_TERM;
        this.predicate = '';
        this.termOrSubject = '';
    }
}
