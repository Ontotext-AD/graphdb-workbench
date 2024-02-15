class HomeSteps {

    static visit() {
        cy.visit('/');
    }

    static visitAndWaitLoader(stubNewWindow) {
        if (stubNewWindow) {
            cy.visit('/', {
                onBeforeLoad (win) {
                    cy.stub(win, 'open').as('window.open');
                }
            });
        } else {
            cy.visit('/');
        }

        cy.window();

        cy.get('.ot-splash').should('not.be.visible');
        return cy.get('.ot-loader-new-content').should('not.exist');
    }

    static verifyTutorialVisible(shouldBeVisible) {
        if (shouldBeVisible) {
            cy.get('.tutorial-container')
                .should('be.visible');
        } else {
            cy.get('.tutorial-container')
                .should('not.exist');
        }
    }

    static declineTutorial() {
        // Click "No, thanks" button
        cy.get('.tutorial-container .decline-tutorial').click();
    }

    static selectSPARQLQueryToExecute(query)  {
        cy.contains('ul.saved-queries li', query)
            .should('be.visible')
            .trigger('hover')
            .find('.execute-saved-query')
            .click({force: true});
    }

    static verifyQueryLink(queryName, modifiesRepoModal) {
        HomeSteps.selectSPARQLQueryToExecute(queryName);
        modifiesRepoModal ? cy.get('.modal-body').should('be.visible') : cy.get('.modal-body').should('not.exist');
        HomeSteps.visitAndWaitLoader();
    }

    static selectRepo(repositoryId) {
        HomeSteps.visitAndWaitLoader();
        cy.get('ul.repos')
            .contains(repositoryId)
            .closest('.repository')
            .click();
    }

    static createRepo() {
        let repositoryId = 'home-repository-' + Date.now();
        cy.createRepository({id: repositoryId});
        return repositoryId;
    }

    static verifyRepositoryIsSelected(repositoryId) {
        cy.get('ul.repos')
            .contains(repositoryId).should('not.exist');
        cy.get('#btnReposGroup')
            .should('contain', repositoryId);
    }

    static hasRepositoryInfo(repositoryId) {
        cy.get('.active-repo-card')
            .should('contain', repositoryId)
            .and('contain', 'total statements')
            .and('contain', 'explicit')
            .and('contain', 'inferred')
            .and('contain', 'expansion ratio')
            .within(() => {
                cy.get('.total-statements').should('contain', '70');
                cy.get('.explicit-statements').should('contain', '0');
                cy.get('.inferred-statements').should('contain', '70');
            });
    }

    static verifyCreateRepositoryLink() {
        cy.get('.card.repository-errors').should("be.visible")
            .within(() => {
                cy.get('.create-repository-btn')
                    .click()
                    .url()
                    .should('eq', Cypress.config("baseUrl") + '/repository/create?previous=home');
            });
        cy.get('.big-logo').click();
    }

    static verifyTutorialText(number, text) {
        cy.get('.btn-toolbar > .btn-group >').eq(number).click();
        cy.get('.tutorial-container h1').contains(text).should('be.visible');
    }

    static noAutocompleteToast() {
        // Verify that the “Enable autocomplete” toast message is displayed.
        cy.get('.autocomplete-toast')
            .contains('Autocomplete is OFF').should('be.visible');
    }

    static getAutocompleteInput() {
        let input = cy.get('.home-rdf-resource-search search-resource-input .view-res-input');
        input.should('be.visible');
        return input;
    }

    static shouldHaveAutocompleteResult(uri) {
        return HomeSteps.getAutocompleteResultElement(uri).should("be.visible");
    }

    static autocompleteText(text, uri) {
        HomeSteps.getAutocompleteInput().type(text);
        return HomeSteps.shouldHaveAutocompleteResult(uri);
    }

    static getAutocompleteResultElement(uri) {
        let element = cy.get("#auto-complete-results-wrapper p").contains(uri);
        element.trigger('mouseover');
        return element;
    }

    static verifyAutocompleteResourceLink(uri) {
        cy.get('#results-loader.ot-loader').should('not.exist');
        cy.get('.resource-info').should('be.visible').and("contain", uri);
    }

    static getAutocompleteButton(type) {
        return cy.get('.home-rdf-resource-search search-resource-input .autocomplete-' + type + '-btn');
    }

    static getAutocompleteDisplayTypeButton(type) {
        return cy.get('.home-rdf-resource-search search-resource-input .display-type-' + type + '-btn');
    }

    static goBackAndWaitAutocomplete(callback) {
        cy.server();
        cy.route('/rest/autocomplete/enabled').as('getAutocompleteStatus');
        cy.go('back');
        cy.wait('@getAutocompleteStatus').then(callback);
    }

    static openRdfSearchBox() {
        cy.get('.search-rdf-btn').click();
        cy.get('.search-rdf-input').should('be.visible');
        cy.get('.search-rdf-input search-resource-input .view-res-input').should('be.visible')
            .and('be.focused');
    }

    static doNotOpenRdfSearchBoxButFocusResourceSearch() {
        cy.get('.search-rdf-btn').click();
        cy.get('.search-rdf-input').should('not.exist');
        cy.get('.search-rdf-input search-resource-input .view-res-input').should('not.exist')
        cy.get('#search-resource-input-home > #search-resource-box > input').should('be.visible')
            .and('be.focused');
    }

    static getViewResourceAsLabel() {
        return cy.get('#view-resource-label-home');
    }

    static getActiveRepoAsLabel() {
        return cy.get('#active-repo-label-home');
    }

    static getSavedSparqlQueriesAsLabel() {
        return cy.get('#saved-queries-label-home');
    }

    static getLicenseAsLabel() {
        return cy.get('#license-label-home');
    }

}
export default HomeSteps;
