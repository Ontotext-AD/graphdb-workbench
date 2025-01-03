export class ConnectorsStubs {

    static stubLuceneHasNotSupport() {
        ConnectorsStubs.stubCheckConnector('create', 'lucene-connector', 'Lucene', false);
    }

    static stubCheckConnector(command, connectorName, pluginName, hasSupport) {
        cy.intercept(`rest/connectors/check`, (req) => {
            req.reply({command, connectorName, pluginName, hasSupport});
        }).as(`query-connector-has-not-support`);
    }
}
