export const SimilarityIndexType = {
    'TEXT': 'text',
    'TEXT_LITERAL': 'textLiteral',
    'PREDICATION': 'predication',

    'isTextType': (type) => {
        return SimilarityIndexType.TEXT === type;
    },

    'isTextLiteralType': (type) => {
        return SimilarityIndexType.TEXT_LITERAL === type;
    },

    'isPredicationType': (type) => {
        return SimilarityIndexType.PREDICATION === type;
    }
};
