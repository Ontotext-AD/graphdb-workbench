class HomeSteps {

    static verifyTutorialVisible(shouldBeVisible) {
        if (shouldBeVisible) {
            cy.get('.tutorial-container')
                .should('be.visible');
        } else {
            cy.get('.tutorial-container')
                .should('not.be.visible');
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
    };

    static verifyQueryLink(queryName, modifiesRepoModal, queryURL) {
        HomeSteps.selectSPARQLQueryToExecute(queryName);
        modifiesRepoModal ? cy.get('.modal-body').should('be.visible') : cy.get('.modal-body').should('not.be.visible');
        cy.url().should('eq', Cypress.config("baseUrl") + queryURL);
        cy.visitAndWaitLoader('/');
    }

    static selectRepo(repositoryId) {
        cy.visitAndWaitLoader('/');
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
            .contains(repositoryId).should('be.hidden');
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
                // New repositories would retrieve the /size data a little slower due to some initializations
                cy.get('.total-statements', {timeout: 10000}).should('contain', '70');
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

    static verifyTutorialText = function(number, text) {
        cy.get('.btn-toolbar > .btn-group >').eq(number).click();
        cy.get('.tutorial-container h1').contains(text).should('be.visible');
    }

    static noAutocompleteToast() {
        // Verify that the “Enable autocomplete” toast message is displayed.
        cy.get('.autocomplete-toast')
            .contains('Autocomplete is OFF').should('be.visible');
    }

    static getAutocompleteInput() {
        let input = cy.get('search-resource-input .view-res-input');
        input.should('be.visible');
        return input;
    }

    static shouldHaveAutocompleteResult(uri) {
        HomeSteps.getAutocompleteResultElement(uri).should("be.visible");
    }

    static autocompleteText(text, uri) {
        HomeSteps.getAutocompleteInput().type(text);
        HomeSteps.shouldHaveAutocompleteResult(uri);
    }

    static getAutocompleteResultElement(uri) {
        let element = cy.get("#auto-complete-results-wrapper p").contains(uri);
        element.trigger('mouseover');
        return element;
    }

    static verifyAutocompleteResourceLink(uri) {
        cy.get('#results-loader.ot-loader').should('not.be.visible');
        cy.get('.resource-info').should('be.visible').and("contain", uri);
    }

    static getAutocompleteButton(type) {
        return cy.get('search-resource-input .autocomplete-' + type + '-btn');
    }

    static goBackAndWaitAutocomplete(callback) {
        cy.server();
        cy.route('/rest/autocomplete/enabled').as('getAutocompleteStatus');
        cy.go('back');
        cy.wait('@getAutocompleteStatus').then(callback);
    }
}
export default HomeSteps;
