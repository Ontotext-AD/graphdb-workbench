import {YasrSteps} from "./yasr-steps";

export class YasqeSteps {
    static getYasqe() {
        return cy.get('.yasqe');
    }

    static getQueryTabs() {
        return cy.get('.tabsList');
    }

    static getEditor(yasqeIndex = 0) {
        return cy.get(".yasqe").eq(yasqeIndex);
    }

    static getCodeMirror() {
        return this.getEditor().find('.CodeMirror').then(($el) => {
            // @ts-ignore
            return $el[0].CodeMirror;
        });
    }

    static getExecuteQueryButton() {
        return cy.get('.yasqe_queryButton');
    }

    static executeQuery(tabIndex = 0) {
        this.getExecuteQueryButton(tabIndex).eq(tabIndex).click();
        YasrSteps.getResponseInfo(tabIndex)
            .should('not.have.class', 'hidden')
            .should('not.have.class', 'empty')
            .should('be.visible');
    }

    static executeQueryWithoutWaiteResult(index = 0) {
        this.getExecuteQueryButton(index).click();
    }

    static executeErrorQuery(index = 0) {
        this.getExecuteQueryButton(index).click();
        // Wait a wile for the response information to be present.
        cy.get('.error-response-plugin').should('be.visible');
    }

    static clearEditor() {
        this.getCodeMirror().then((cm) => {
            cm.getDoc().setValue('');
        });
    }

    /**
     * Adds <code>text</code> to the end of current query.
     * @param {string} text - text to be added.
     */
    static writeInEditor(text, parseSpecialCharSequences = false) {
        YasqeSteps.getEditor().find('textarea').type(text, {force: true, parseSpecialCharSequences});
        YasqeSteps.verifyQueryContains(text);
    }

    /**
     * Paste query in Yasqe editor.
     * This method is faster than {@link YasqeSteps.writeInEditor}, but the editor stay pristine, if you want editor to be touched use {@link YasqeSteps.writeInEditor}.
     * @param {string} query - the new value of Yasqe.
     */
    static pasteQuery(query) {
        this.clearEditor();
        this.getCodeMirror().then((cm) => {
            cm.getDoc().setValue(query);
        });
        YasqeSteps.verifyQueryTyped(query);
    }

    static waitUntilQueryIsVisible() {
        return cy.waitUntil(() =>
            this.getEditor().find('.CodeMirror')
                .then((codeMirrorEl) =>
                    codeMirrorEl && codeMirrorEl[0].CodeMirror.getValue().trim().length > 0));
    }

    static verifyQueryTyped(query) {
        return cy.waitUntil(() =>
            this.getEditor().find('.CodeMirror')
                .then((codeMirrorEl) => {
                    return codeMirrorEl && codeMirrorEl[0].CodeMirror.getValue().indexOf(query) !== -1;
                }));
    }

    static verifyQueryContains(queryPart) {
        this.getCodeMirror().then((cm) => {
            expect(cm.getValue().replace(/\s/g, '')).contain(queryPart.replace(/\s/g, ''));
        });
    }

    /**
     * In certain scenarios we need to wait a bit before trying to get the query from the editor. For example, when the
     * query is dynamically switched using the yasgui api, it may take some time before the old query gets replaced or
     * removed from the editor.
     * @param {number} delay The time in milliseconds to wait before trying to get the editor and its query.
     * @return {Cypress.Chainable<unknown>}
     */
    static getQuery(delay = 0) {
        return cy.wait(delay).then(() => this.getCodeMirror()).then((cm) => {
            return cm.getValue();
        });
    }

    static getControlBar() {
        return cy.get('.controlbar');
    }

    static getIncludeInferredStatementsButton() {
        return cy.get('.yasqe_inferStatementsButton');
    }

    static getIncludeInferredStatementsButtonTooltip() {
        return this.getIncludeInferredStatementsButton().parent();
    }

    static includeInferredStatements() {
        this.getIncludeInferredStatementsButton().click();
    }

    static getExpandResultsOverSameAsButton() {
        return cy.get('.yasqe_expandResultsButton');
    }

    static getExpandResultsOverSameAsButtonTooltip() {
        return this.getExpandResultsOverSameAsButton().parent();
    }

    static expandResultsOverSameAs() {
        this.getExpandResultsOverSameAsButton().click();
    }

    static getShareQueryButton() {
        return cy.get('.yasqe_shareQueryButton');
    }

    static shareQuery() {
        this.getShareQueryButton().click();
    }

    static getAbortQueryButton() {
        return cy.get('.abort-button');
    }

    static hoverOverAbortQueryButton() {
        YasqeSteps.getAbortQueryButton().realHover();
    }

    static getAbortQueryTooltip() {
        return YasqeSteps.getAbortQueryButton().parent();
    }

    static getActionsToolbar() {
        return YasqeSteps.getEditor().find('.yasqe_buttons');
    }

    static getActionButtonsTooltips() {
        return YasqeSteps.getActionsToolbar().find('yasgui-tooltip');
    }

    static getActionButtonTooltip(index) {
        return YasqeSteps.getActionButtonsTooltips().eq(index);
    }

    static getActionButtons() {
        return YasqeSteps.getActionsToolbar().find('.custom-button');
    }

    static getActionButton(index) {
        return YasqeSteps.getActionButtons().eq(index);
    }
}
