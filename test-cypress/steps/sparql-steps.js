class SparqlSteps {

    static createRepoAndVisit(repositoryId, repoOptions = {}) {
        this.createRepository(repositoryId, repoOptions);
        this.visitSparql(true, repositoryId);
    }

    static createRepository(repositoryId, repoOptions = {}) {
        repoOptions.id = repositoryId;
        cy.createRepository(repoOptions);
        cy.initializeRepository(repositoryId);
    }

    static waitUntilSparqlPageIsLoaded() {
        cy.window();
        // Workbench loading screen should not be visible
        cy.get('.ot-splash').should('not.be.visible');

        // Run query button should be clickable
        this.getRunQueryButton().should('be.visible').and('not.be.disabled');

        this.waitUntilQueryIsVisible();

        // Run query button should be clickable
        this.getRunQueryButton().should('be.visible').and('not.be.disabled');

        // Editor should have a visible tab
        this.getTabs().find('.nav-link').should('be.visible');

        // No active loader
        this.getLoader().should('not.exist');
    }

    static visitSparql(resetLocalStorage, repositoryId) {
        cy.visit('/sparql', {
            onBeforeLoad: (win) => {
                if (resetLocalStorage) {
                    // Needed because the workbench app is very persistent with its local storage (it's hooked on before unload event)
                    // TODO: Add a test that tests this !
                    if (win.localStorage) {
                        win.localStorage.clear();
                    }
                    if (win.sessionStorage) {
                        win.sessionStorage.clear();
                    }
                }
                win.localStorage.setItem('com.ontotext.graphdb.repository', repositoryId);
            }
        });
        this.waitUntilSparqlPageIsLoaded();
    }

    static getLoader() {
        return cy.get('.ot-loader-new-content');
    }

    static executeQuery() {
        this.getRunQueryButton().click();
        this.getLoader().should('not.exist');
    }

    static getRunQueryButton() {
        return cy.get('#wb-sparql-runQuery');
    }

    static getQueryArea() {
        return cy.get('#queryEditor .CodeMirror');
    }

    static waitUntilQueryIsVisible() {
        return cy.waitUntil(() =>
            this.getQueryArea()
                .then(codeMirrorEl =>
                    codeMirrorEl && codeMirrorEl[0].CodeMirror.getValue().trim().length > 0));
    }

    static getTabs() {
        return cy.get('#sparql-content .nav-tabs .sparql-tab');
    }

    static getSavedQueriesPopupBtn() {
        return cy.get('#wb-sparql-toggleSampleQueries');
    }

    static openSavedQueriesPopup() {
        this.getSavedQueriesPopupBtn().click();
    }

    static getPopover() {
        return cy.get('.popover')
            .should('not.have.class', 'ng-animate')
            .and('not.have.class', 'in-add')
            .and('not.have.class', 'in-add-active');
    }

    static getSavedQueryFromPopup(savedQueryName) {
        return cy.get('#wb-sparql-queryInSampleQueries')
            .contains(savedQueryName)
            .closest('.saved-query');
    }

    static selectSavedQuery(savedQueryName) {
        this.openSavedQueriesPopup();
        this.getPopover().should('be.visible');
        this.getSavedQueryFromPopup(savedQueryName)
            .find('a')
            // the popup is opened and the link with the text is visible but cypress think it's 0x0px width/height
            .click({force: true});
    }

    static getSparqlQueryUpdateLabel() {
        return cy.get('#sparql-query-update-title-label');
    }

    static getDownloadBtn() {
        return cy.get('#saveAsBtn');
    }

    static getEditorAndResultsBtn() {
        return cy.get('.editor-and-results-btn');
    }

    static getResultsOnlyBtn() {
        return cy.get('.results-only-btn');
    }

    static getTabWithTableText() {
        return cy.get('.select_table');
    }

    static getTabWithRawResponseText() {
        return cy.get('.select_rawResponse');
    }

    static getTabWithPivotTableText() {
        return cy.get('.select_pivot');
    }

    static getTabWithGoogleChartText() {
        return cy.get('.select_gchart');
    }

    static getResultsDescription() {
        return cy.get('.results-description');
    }
}

export default SparqlSteps;
