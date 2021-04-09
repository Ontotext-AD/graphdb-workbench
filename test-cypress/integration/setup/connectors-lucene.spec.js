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
        getOkButton()
            .click();
        getConnectorCreationDialog()
            .and('contain', luceneConnectorName);
        getConnectorStatusToastMessage()
            .should('be.visible')
            .and('contain', connectorCreateToastMessage);
        //copy connector
        getConnectorInstance(0)
            .find('.icon-copy')
            .should('be.visible')
            .click();
        getOkButton()
            .click({force:true});
        getConnectorCreationDialog()
            .and('contain', luceneConnectorName + '-copy');
        getConnectorStatusToastMessage()
            .should('be.visible')
            .and('contain', connectorCreateToastMessage + '-copy');
        //delete connector copy
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

    function getOkButton() {
        return getCreateLuceneConnectorPage()
            .find('.create-connector-btn')
            .scrollIntoView()
            .should('be.visible');
    }

    function getConnectorCreationDialog() {
        return cy.get('.modal-content > .modal-header.creating-connector-dialog').should('be.visible');
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
        return cy.get('.delete-connector-btn');
    }

});
