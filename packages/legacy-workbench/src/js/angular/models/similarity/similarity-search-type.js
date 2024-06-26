export const SimilaritySearchType = {
    'SEARCH_TERM': 'searchTerm',
    'SEARCH_ANALOGICAL': 'searchAnalogical',
    'SEARCH_ENTITY': 'searchEntity',
    'SEARCH_ENTITY_PREDICATE': 'searchEntityPredicate',
    'SEARCH_DOCUMENT': 'searchDocumentID',

    'isSearchTermType': (type) => {
        return SimilaritySearchType.SEARCH_TERM === type;
    },

    'isSearchAnalogicalType': (type) => {
        return SimilaritySearchType.SEARCH_ANALOGICAL === type;
    },

    'isSearchEntityType': (type) => {
        return SimilaritySearchType.SEARCH_ENTITY === type;
    },

    'isSearchEntityPredicateType': (type) => {
        return SimilaritySearchType.SEARCH_ENTITY_PREDICATE === type;
    },

    'isSearchDocumentType': (type) => {
        return SimilaritySearchType.SEARCH_DOCUMENT === type;
    }
};
