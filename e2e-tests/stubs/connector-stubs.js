import {Stubs} from "./stubs";

export class ConnectorStubs extends Stubs {
    static stubGetConnectors() {
        this.stubQueryResponse('/rest/connectors', '/connectors/get-connectors.json', 'get-connectors');
    }

    static stubGetRetrievalConnector(fixture = `/connectors/get-retrieval-connector.json`) {
        this.stubQueryResponse(
            `/rest/connectors/existing?prefix=http%3A%2F%2Fwww.ontotext.com%2Fconnectors%2Fretrieval%23`,
            fixture,
            'get-connector'
        );
    }

    /**
     * Stubs ChatGPT connectors for three repositories:
     * <ol>
     *     <li> "starwars" - it has two connectors "ChatGPT_starwars_one" and "ChatGPT_starwars_two"
     *     <li> "biomarkers" - it has one connector "ChatGPT_biomarkers_one"
     *     <li> "ttyg-repo-1725518186812" - it has no any connections.
     * </ol>
     * @param {number} delay
     */
    static stubTTYGChatGPTConnectors(delay = 0) {
        cy.fixture('/connectors/get-ttyg-chatgpt-connectors.json').then((body) => {
            cy.intercept('/rest/connectors/existing?prefix=http%3A%2F%2Fwww.ontotext.com%2Fconnectors%2Fretrieval%23', (req) => {
                const repositoryId = req.headers['x-graphdb-repository'];
                const connectors = body[repositoryId];
                // Respond with the modified body
                req.reply({
                    statusCode: 200,
                    body: JSON.stringify(connectors),
                    delay: delay
                });
            }).as('get-ttyg-ChatGPT-connector');
        });
    }
}
