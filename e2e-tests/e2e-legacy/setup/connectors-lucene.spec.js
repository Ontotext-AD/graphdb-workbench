describe('Setup / Connectors - Lucene', () => {

    let repositoryId;
    const luceneConnectorName = 'lucene-test-index';
    const fieldName = 'grape';
    const connectorPropertyChain = 'http://www.ontotext.com/example/wine#madeFromGrape';
    const uriType = 'http://www.ontotext.com/example/wine#Wine';
    const connectorCreateToastMessage = 'Created connector ' + luceneConnectorName;
    const connectorDeleteToastMessage = 'Deleted connector ' + luceneConnectorName;

    beforeEach(() => {
        repositoryId = 'repo' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        cy.visit('/connectors');
        cy.window();
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Test that no indexes are available', () => {
        getConnectorsPage()
            .should('be.visible')
            .and('contain', 'No connector instances.');
    });

    it('Create, copy and delete a lucene connector', () => {
        getNewLuceneConnectorButton()
            .click();

        getCreateLuceneConnectorPage()
            .should('contain', 'Create new Lucene Connector')
            .within(() => {
                getConnectorNameField()
                    .type(luceneConnectorName);
                getFieldNameField()
                    .type(fieldName, {force: true});
                getPropertyChainField()
                    .type(connectorPropertyChain, {force: true});
                getUriTypes()
                    .type(uriType);
                confirmCreateConnector();
            });

        verifyStatusToastMessage(connectorCreateToastMessage);
        verifyConnectorExists(luceneConnectorName);
        //copy connector
        getConnectorInstance(0)
            .find('.icon-copy')
            .should('be.visible')
            .click()
            .then(() => {
                getCreateLuceneConnectorPage()
                    .within(() => {
                        confirmCreateConnector();
                    });
                verifyStatusToastMessage(connectorCreateToastMessage + '-copy');
                verifyConnectorExists(luceneConnectorName + '-copy');
                //delete connector copy
                getConnectorInstance(1)
                    .find('.icon-trash')
                    .should('be.visible')
                    .click();
                getConfirmConnectorDeletebutton()
                    .should('be.visible')
                    .click()
                    .then(() => {
                        verifyStatusToastMessage(connectorDeleteToastMessage + '-copy');
                    });
            });
    });

    function getConnectorsPage() {
        return cy.get('.connectorsPage').should('be.visible');
    }

    function getNewLuceneConnectorButton() {
        return getConnectorsPage().find('.new-connector-btn').contains('Lucene');
    }

    function getCreateLuceneConnectorPage() {
        return cy.get('.modal-content').scrollIntoView().should('be.visible');
    }

    function getConnectorNameField() {
        return cy.get('.connector-name-field input');
    }

    function getFieldNameField() {
        return cy.get('.child-property-fieldName input');
    }

    function getPropertyChainField() {
        return cy.get('.child-property-propertyChain input');
    }

    function getUriTypes() {
        return cy.get('.property-types input');
    }

    function confirmCreateConnector() {
        cy.get('.create-connector-btn')
            .scrollIntoView()
            .should('be.visible')
            .then((btn) => {
                cy.wrap(btn).click();
            });
    }

    function verifyConnectorExists(connectorName) {
        cy.waitUntil(() =>
            cy.get('#accordion-Lucene')
                .then(connectorTable => connectorTable && cy.wrap(connectorTable).contains(connectorName)));
    }

    function verifyStatusToastMessage(successMessage) {
        cy.waitUntil(() =>
            cy.get('.toast-message')
                .then(msg => msg && msg.text().indexOf(successMessage) > -1))
            .then(() => {
                cy.hideToastContainer();
            });
    }

    function getConnectorInstance(indexNumber) {
        return cy.get('#heading-Lucene' + indexNumber);
    }

    function getConfirmConnectorDeletebutton() {
        return cy.get('.delete-connector-btn');
    }
});
