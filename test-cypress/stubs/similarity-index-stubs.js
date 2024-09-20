import {Stubs} from "./stubs";

export class SimilarityIndexStubs extends Stubs {
    static stubGetSimilarityIndexes(fixture = '/similarity/get-similarity-indexes.json', delay = 0) {
        this.stubQueryResponse('/rest/similarity', fixture, 'get-similarity-indexes', delay);
    }
}
