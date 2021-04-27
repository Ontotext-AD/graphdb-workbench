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
            .should('be.visible')
            .and('contain', 'Create new Lucene Connector');
        getConnectorNameField()
            .type(luceneConnectorName);
        getFieldNameField()
            .type(fieldName, {force:true});
        getPropertyChainField()
            .type(connectorPropertyChain, {force:true});
        getUriTypes()
            .type(uriType);
        confirmCreateConnector();
        verifyStatusToastMessage(connectorCreateToastMessage);
        verifyConnectorExists(luceneConnectorName);
        //copy connector
        getConnectorInstance(0)
            .find('.icon-copy')
            .should('be.visible')
            .click()
            .then(() => {
                confirmCreateConnector();
                verifyStatusToastMessage(connectorCreateToastMessage + '-copy');
                verifyConnectorExists(luceneConnectorName + '-copy');
                //delete connector copy
                getConnectorInstance(1)
                    .find('.icon-trash')
                    .should('be.visible')
                    .click();
                getConfirmConnectorDeletebutton()
                    .should('be.visible')
                    .click();
                verifyStatusToastMessage(connectorDeleteToastMessage + '-copy');
        });
    });

    function getConnectorsPage() {
        return cy.get('.connectorsPage').should('be.visible');
    }

    function getNewLuceneConnectorButton() {
        return getConnectorsPage().find('.new-connector-btn');
    }

    function getCreateLuceneConnectorPage() {
        return cy.get('.modal-content').should('be.visible');
    }

    function getConnectorNameField() {
        return getCreateLuceneConnectorPage().find('.connector-name-field input');
    }

    function getFieldNameField() {
        return getCreateLuceneConnectorPage().find('.child-property-fieldName input');
    }

    function getPropertyChainField() {
        return getCreateLuceneConnectorPage().find('.child-property-propertyChain input');
    }

    function getUriTypes() {
        return getCreateLuceneConnectorPage().find('.property-types input');
    }

    function confirmCreateConnector() {
        getCreateLuceneConnectorPage()
            .within(() => {
                cy.get('.create-connector-btn')
                    .scrollIntoView()
                    .should('be.visible')
                    .then((btn) => {
                        cy.wrap(btn).click();
                    });
        });
    }

    function verifyConnectorExists(connectorName) {
        cy.waitUntil(() =>
            cy.get('#accordion-Lucene')
                .then(connectorTable => connectorTable && cy.wrap(connectorTable).contains(connectorName)));
    }

    function verifyStatusToastMessage(successMessage) {
        cy.waitUntil(fn =>
            cy.get('.toast-message')
                .then(msg => msg && msg.text().indexOf(successMessage) > -1))
            .then(() => {
                hideToastContainer();
            });
    }

    function getConnectorInstance(indexNumber) {
        return cy.get('#heading-Lucene' + indexNumber);
    }

    function getConfirmConnectorDeletebutton() {
        return cy.get('.delete-connector-btn');
    }

    /**
     *  Toast success container for some reason
     *  is overlapping create connector button
     */
    function hideToastContainer() {
        cy.get('.toast-success')
            .then(toastContainer => toastContainer.hide());
    }
});
