export class YasqeSteps {
    static getYasqe() {
        return cy.get('.yasqe');
    }

    static getQueryTabs() {
        return cy.get('.tabsList');
    }

    static getEditor() {
        return cy.get(".yasqe:visible");
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
}
