Cypress.Commands.add('pasteQuery', (query) => {
    clearQuery();
    // Using force because the textarea is not visible
    getQueryTextArea().invoke('val', query).trigger('change', {force: true});
    waitUntilQueryIsVisible();
});

Cypress.Commands.add('executeQuery', () => {
    getRunQueryButton().click();
    getLoader().should('not.be.visible');
});

Cypress.Commands.add('verifyResultsPageLength', (resultLength) => {
    getResultsWrapper().should('be.visible');
    getTableResultRows()
        .should('have.length', resultLength);
});

Cypress.Commands.add('verifyResultsMessage', (msg) => {
    getResultsMessage()
        .should('be.visible')
        .and('contain', msg);
});

Cypress.Commands.add('waitUntilQueryIsVisible', (query) => {
    waitUntilQueryIsVisible();
});

// Helper functions

function clearQuery() {
    // Using force because the textarea is not visible
    getQueryTextArea().type('{ctrl}a{backspace}', {force: true});
}

function getQueryArea() {
    return cy.get('#queryEditor .CodeMirror');
}

function getQueryTextArea() {
    return getQueryArea().find('textarea');
}

function waitUntilQueryIsVisible() {
    getQueryArea().should(codeMirrorEl => {
        const cm = codeMirrorEl[0].CodeMirror;
        expect(cm.getValue().trim().length > 0).to.be.true;
    });
}

function getRunQueryButton() {
    return cy.get('#wb-sparql-runQuery');
}

function getLoader() {
    return cy.get('.ot-loader-new-content');
}

function getTableResultRows() {
    return getResultsWrapper().find('.resultsTable tbody tr');
}

function getResultsWrapper() {
    return cy.get('#yasr-inner .yasr_results');
}

function getResultsMessage() {
    return cy.get('#yasr-inner .alert-info.results-info', { timeout: 30000 });
}
