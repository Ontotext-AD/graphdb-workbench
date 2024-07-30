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
        getResultsMessage().then((resultInfo) => resultInfo && resultInfo.text().trim().length > 0));
    getResultsMessage().should('contain', msg);
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

Cypress.Commands.add('pasteIntoCodeMirror', (selector, text) => {
    cy.get(selector).then((codeMirrorElement) => {
        const codeMirror = codeMirrorElement[0].CodeMirror;
        const event = new ClipboardEvent('paste', {
            bubbles: true,
            cancelable: true,
            clipboardData: new DataTransfer()
        });
        event.clipboardData.setData('text/plain', text);

        const inputField = codeMirror.getInputField();
        inputField.dispatchEvent(event);
    });
});

// Helper functions

function clearQuery() {
    // Using force because the textarea is not visible
    getQueryTextArea().type(Cypress.env('modifierKey') + 'a{backspace}', {force: true});
}

function getQueryArea() {
    return cy.get('#query-editor .CodeMirror');
}

function getQueryTextArea() {
    return getQueryArea().find('textarea');
}

function waitUntilQueryIsVisible() {
    return cy.waitUntil(() =>
        getQueryArea()
            .then(codeMirrorEl =>
                codeMirrorEl && codeMirrorEl[0].CodeMirror.getValue().trim().length > 0));
}

function verifyQueryAreaContains(query) {
    cy.waitUntil(() =>
        getQueryArea()
            .then(codeMirrorEl => codeMirrorEl && typeof codeMirrorEl[0].CodeMirror.getValue() === 'string'));
    // Using the CodeMirror instance because getting the value from the DOM is very cumbersome
    getQueryArea().then(codeMirrorEl => codeMirrorEl && codeMirrorEl[0].CodeMirror.getValue()).should('contain', query);
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
