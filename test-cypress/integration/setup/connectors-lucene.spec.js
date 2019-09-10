describe('Setup / Connectors - Lucene', () => {

    let repositoryId;
    const luceneConnectorName = 'lucene-test-index';
    const fieldName = 'grape';
    const connectorPropertyChain = 'http://www.ontotext.com/example/wine#madeFromGrape';
    const uriType = 'http://www.ontotext.com/example/wine#Wine';
    const connectorCreateToastMessage = 'Created connector ' + luceneConnectorName;
    const connectorDeleteToastMessage = 'Deleted connector ' + luceneConnectorName;

    before(() => {
        repositoryId = 'repo' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepositoryCookie(repositoryId);
        cy.visit('/connectors');
    });

    after(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Test that no indexes are available', () => {
        getConnectorsPage()
            .should('be.visible')
            .and('contain', 'No connector instances.');
    });

    it('Create a lucene connector', () => {
        getNewLuceneConnectorButton()
            .click();
        getCreateLuceneConnectorPage()
            .should('be.visible')
            .and('contain', 'Create new Lucene Connector');
        getConnectorNameField()
            .find('input')
            .type(luceneConnectorName);
        getFieldNameField()
            .find('input')
            .type(fieldName, {force:true});
        getPropertyChainField()
            .find('input')
            .type(connectorPropertyChain, {force:true});
        getUriTypes()
            .find('input')
            .type(uriType);
        getOkButton()
            .click();
        getConnectorCreationDialog()
            .should('be.visible')
            .and('contain', luceneConnectorName);
        getConnectorStatusToastMessage()
            .should('be.visible')
            .and('contain', connectorCreateToastMessage);
    });

    it('Test connector copy functionality', () => {
        getConnectorsPage()
            .should('be.visible');
        getConnectorInstance(0)
            .find('.icon-copy')
            .should('be.visible')
            .click();
        getOkButton()
            .click({force:true});
        getConnectorCreationDialog()
            .should('be.visible')
            .and('contain', luceneConnectorName + '-copy');
        getConnectorStatusToastMessage()
            .should('be.visible')
            .and('contain', connectorCreateToastMessage + '-copy');
    });

    it('Test connector delete functionality', () => {
        getConnectorInstance(1)
            .find('.icon-trash')
            .should('be.visible')
            .click();
        getConfirmConnectorDeletebutton()
            .should('be.visible')
            .click();
        getConnectorStatusToastMessage()
            .should('be.visible')
            .and('contain', connectorDeleteToastMessage + '-copy');
    });

    function getConnectorsPage() {
        return cy.get('.connectorsPage');
    }

    function getNewLuceneConnectorButton() {
        return getConnectorsPage().find('.new-connector-btn');
    }

    function getCreateLuceneConnectorPage() {
        return cy.get('.modal-content');
    }

    function getConnectorNameField() {
        return getCreateLuceneConnectorPage().find('.connector-name-field');
    }

    function getFieldNameField() {
        return getCreateLuceneConnectorPage().find('.child-property-fieldName');
    }

    function getPropertyChainField() {
        return getCreateLuceneConnectorPage().find('.child-property-propertyChain');
    }

    function getUriTypes() {
        return getCreateLuceneConnectorPage().find('.property-types');
    }

    function getOkButton() {
        return getCreateLuceneConnectorPage().find('.create-connector-btn');
    }

    function waitUntilConnectorsPageIsLoaded() {
        // Workbench loading screen should not be visible
        cy.get('.ot-splash').should('not.be.visible');

        // No active loader
        cy.get('.ot-loader').should('not.be.visible');
        cy.get('.creating-connector-dialog').should('not.be.visible');
        getConnectorsPage()
            .should('be.visible');
    }

    function getConnectorCreationDialog() {
        return cy.get('.creating-connector-dialog');
    }

    function getConnectorStatusToastMessage() {
        return cy.get('.toast-message');
    }

    function getIconCopyButton() {
        return getConnectorsPage().find('.icon-copy');
    }

    function getConnectorInstance(indexNumber) {
        return cy.get('#heading-Lucene' + indexNumber);
    }

    function getIconTrashButton() {
        return cy.get('.icon-trash');
    }

    function getConfirmConnectorDeletebutton() {
        return cy.get('.confirm-btn');
    }

});
