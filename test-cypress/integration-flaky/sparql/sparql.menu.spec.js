import SparqlSteps from '../../steps/sparql-steps';

describe('SPARQL screen validation', () => {
    let repositoryId;

    const DEFAULT_QUERY = 'select * where { \n' +
        '\t?s ?p ?o .\n' +
        '} limit 100';

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    context('SPARQL queries & filtering', () => {
        beforeEach(() => {
            repositoryId = 'sparql-' + Date.now();
            SparqlSteps.createRepoAndVisit(repositoryId)
        });

        it('Test execute query with and without "Including inferred" selected', () => {
            let insertQuery = 'INSERT DATA { <urn:a> <http://a/b> <urn:b> . <urn:b> <http://a/b> <urn:c> . }';

            cy.pasteQuery(insertQuery);
            SparqlSteps.executeQuery();

            getUpdateMessage().should('be.visible');
            getResultsWrapper().should('not.be.visible');

            // Should be enabled by default
            getInferenceButton()
                .find('.icon-inferred-on')
                .should('be.visible');

            cy.pasteQuery(DEFAULT_QUERY);
            SparqlSteps.executeQuery();

            // Confirm that all statements are available (70 from ruleset, 2 explicit and 2 inferred)
            getResultsWrapper().should('be.visible');

            verifyResultsPageLength(74);

            // Uncheck ‘Include inferred’
            cy.waitUntil(() =>
                getInferenceButton().find('.icon-inferred-on')
                    .then(infBtn => infBtn && cy.wrap(infBtn).click()))
                .then(() =>
                    cy.get('.icon-inferred-off').should('be.visible'));

            // Confirm that only inferred statements (only 2) are available
            SparqlSteps.executeQuery();
            verifyResultsPageLength(2);
        });
    });

    function getTableResultRows() {
        return getResultsWrapper().find('.resultsTable tbody tr');
    }

    function verifyResultsPageLength(resultLength) {
        getTableResultRows()
            .should('have.length', resultLength);
    }

    function getUpdateMessage() {
        return cy.get('#yasr-inner .alert-info.update-info');
    }

    function getResultsWrapper() {
        return cy.get('#yasr-inner .yasr_results');
    }

    function getInferenceButton() {
        return cy.get('#inference').scrollIntoView();
    }
});
