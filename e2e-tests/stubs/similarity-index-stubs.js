import {Stubs} from "./stubs";

export class SimilarityIndexStubs extends Stubs {
    static stubGetSimilarityIndexes(fixture = '/similarity/get-similarity-indexes.json', delay = 0) {
        this.stubQueryResponse('/rest/similarity', fixture, 'get-similarity-indexes', delay);
    }


    /**
     * Stubs Similarity indexes for three repositories:
     * <ol>
     *     <li> "starwars" - it has two similarity indexes "similarity_index_starwars_one" and "similarity_index_starwars_two"
     *     <li> "biomarkers" - it has one similarity index "similarity_index_biomarkers_one"
     *     <li> "ttyg-repo-1725518186812" - it has no any similarity indexes.
     * </ol>
     * @param {number} delay
     */
    static stubTTYGSimilarityIndexes(delay = 0) {
        cy.fixture('/similarity/get-ttyg-similarity-connectors.json').then((body) => {
            cy.intercept('/rest/similarity', (req) => {
                const repositoryId = req.headers['x-graphdb-repository'];
                const connectors = body[repositoryId];
                // Respond with the modified body
                req.reply({
                    statusCode: 200,
                    body: JSON.stringify(connectors),
                    delay: delay
                });
            }).as('get-ttyg-similarity-indexes');
        });
    }
}
