import {Stubs} from "./stubs";

export class SimilarityIndexStubs extends Stubs {
    static stubGetSimilarityIndexes() {
        this.stubQueryResponse('/rest/similarity', '/similarity/get-similarity-indexes.json', 'get-similarity-indexes');
    }
}
