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

    static writeInEditor(text, parseSpecialCharSequences = false) {
        this.getEditor().find('textarea').type(text, {force: true, parseSpecialCharSequences});
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
