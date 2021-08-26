describe('Autocomplete ', () => {

    let repositoryId;

    function createRepository() {
        repositoryId = 'autocomplete-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        cy.initializeRepository(repositoryId);
    }

    function waitUntilAutocompletePageIsLoaded() {
        // Workbench loading screen should not be visible
        cy.get('.ot-splash').should('not.be.visible');

        // No active loader
        cy.get('.ot-loader').should('not.exist');

        // No warnings should be present
        getAutocompletePage().find('.alert-warning').should('not.be.visible');

        getAutocompleteIndex().should('be.visible');
    }

    beforeEach(() => {
        createRepository();
        cy.visit('/autocomplete');
        cy.window();
        waitUntilAutocompletePageIsLoaded();
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('should allow to enable the autocomplete', () => {
        // Verify initial status is OFF
        getAutocompleteHeader()
            .should('be.visible')
            .and('contain', repositoryId);
        getAutocompleteHeader()
            .find('.tag-default')
            .should('be.visible')
            .and('contain', 'OFF');
        getAutocompleteSwitch()
            .find('input')
            .should('not.be.checked');
        getAutocompleteStatus().should('not.be.visible');
        getBuildButton().should('not.be.visible');

        // Should allow to add autocomplete labels
        getToggleIRIButton()
            .should('be.visible')
            .and('not.be.disabled');
        getAddLabelButton()
            .should('be.visible')
            .and('not.be.disabled');

        // Should have default labels
        getAutocompleteLabels()
            .should('be.visible')
            .find('.wb-autocomplete-labels-row')
            .should('have.length', 1)
            .and('contain', 'http://www.w3.org/2000/01/rdf-schema#label');

        // Enable autocomplete and verify status is OK (possible slow operation)
        getAutocompleteSwitch().click();
        getAutocompleteHeader()
            .find('.tag-primary')
            .should('be.visible')
            .and('contain', 'ON');
        getAutocompleteStatus()
            .should('be.visible')
            .find('.tag-success')
            .should('be.visible')
            .and('contain', 'Ready');
        getBuildButton()
            .should('be.visible')
            .and('not.be.disabled');
    });

    function getAutocompletePage() {
        return cy.get('#autocomplete');
    }

    function getAutocompleteIndex() {
        return getAutocompletePage().find('#toggleIndex');
    }

    function getAutocompleteHeader() {
        return getAutocompleteIndex().find('.autocomplete-header');
    }

    function getAutocompleteSwitch() {
        return getAutocompleteIndex().find('.autocomplete-switch');
    }

    function getAutocompleteStatus() {
        return getAutocompleteIndex().find('.autocomplete-status');
    }

    function getBuildButton() {
        return getAutocompleteIndex().find('.build-index-btn');
    }

    function getToggleIRIButton() {
        return getAutocompletePage().find('#toggleIRIs');
    }

    function getAddLabelButton() {
        return getAutocompletePage().find('#wb-autocomplete-addLabel');
    }

    function getAutocompleteLabels() {
        return getAutocompletePage().find('#wb-autocomplete-labels');
    }

});
