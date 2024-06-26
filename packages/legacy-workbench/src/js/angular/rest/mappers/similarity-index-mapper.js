import {SimilarityIndex} from "../../models/similarity/similarity-index";

/**
 * Maps the response data to SimilarityIndex objects.
 * @param {*} responseData
 * @return {SimilarityIndex[]}
 */
export const mapIndexesResponseToSimilarityIndex = (responseData) => {
    return responseData.map((index) => {
        const similarityIndex = new SimilarityIndex();
        similarityIndex.type = index.type;
        similarityIndex.stopList = index.stopList;
        similarityIndex.status = index.status;
        similarityIndex.selectQuery = index.selectQuery;
        similarityIndex.searchQuery = index.searchQuery;
        similarityIndex.sameAs = index.sameAs;
        similarityIndex.options = index.options;
        similarityIndex.name = index.name;
        similarityIndex.infer = index.infer;
        similarityIndex.analyzer = index.analyzer;
        similarityIndex.analogicalQuery = index.analogicalQuery;
        return similarityIndex;
    });
};
