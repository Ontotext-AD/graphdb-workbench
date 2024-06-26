export const SimilarityResultType = {
    'TERM_RESULT': 'termResult',
    'DOCUMENT_RESULT': 'documentResult',
    'ENTITY_RESULT': 'entityResult',

    'isResultDocumentType': (type) => {
        return SimilarityResultType.DOCUMENT_RESULT === type;
    },

    'isResultTermType': (type) => {
        return SimilarityResultType.TERM_RESULT === type;
    }
};
