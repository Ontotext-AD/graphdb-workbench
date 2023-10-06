Cypress.Commands.add('pasteQuery', (query) => {
    // Setting the textarea and the calling setValue seems to work
    // more reliably then other strategies (see history)
    getQueryTextArea().invoke('val', query);
    getQueryArea().then(codeMirrorEl => {
        codeMirrorEl[0].CodeMirror.setValue(query);
    });
});

Cypress.Commands.add('executeQuery', () => {
    getRunQueryButton().click();
    getLoader().should('not.exist');
});

Cypress.Commands.add('verifyResultsPageLength', (resultLength) => {
    getResultsWrapper().should('be.visible');
    getTableResultRows()
        .should('have.length', resultLength);
});

Cypress.Commands.add('verifyResultsMessage', (msg) => {
    cy.waitUntil(() =>
        getResultsMessage()
            .then((resultInfo) => resultInfo && resultInfo.text().trim().indexOf(msg) > -1));
});

Cypress.Commands.add('getResultsMessage', () => {
    cy.waitUntil(() =>
        getResultsMessage()
            .then(resultInfo => resultInfo));
});

Cypress.Commands.add('waitUntilQueryIsVisible', () => {
    waitUntilQueryIsVisible();
});

Cypress.Commands.add('verifyQueryAreaContains', (query) => {
    verifyQueryAreaContains(query);
});
// Helper functions

function clearQuery() {
    // Using force because the textarea is not visible
    getQueryTextArea().type(Cypress.env('modifierKey') + 'a{backspace}', {force: true});
}

function getQueryArea() {
    return cy.get('#queryEditor .CodeMirror');
}

function getQueryTextArea() {
    return getQueryArea().find('textarea').scrollIntoView().should('be.visible');
}

function waitUntilQueryIsVisible() {
    return cy.waitUntil(() =>
        getQueryArea()
            .then(codeMirrorEl =>
                codeMirrorEl && codeMirrorEl[0].CodeMirror.getValue().trim().length > 0));
}

function verifyQueryAreaContains(query) {
    // Using the CodeMirror instance because getting the value from the DOM is very cumbersome
    cy.waitUntil(() =>
        getQueryArea()
            .then(codeMirrorEl => codeMirrorEl && codeMirrorEl[0].CodeMirror.getValue().trim().indexOf(query) > -1));
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
    return cy.get('#yasr-inner .alert-info.results-info').scrollIntoView();
}
