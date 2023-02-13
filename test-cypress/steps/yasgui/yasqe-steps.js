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

    static getExecuteQueryButton() {
        return cy.get('.yasqe_queryButton');
    }

    static executeQuery(tabIndex = 0) {
        this.getExecuteQueryButton(tabIndex).eq(tabIndex).click();
    }

    static getControlBar() {
        return cy.get('.controlbar');
    }

    static getIncludeInferredStatementsButton() {
        return cy.get('.yasqe_inferStatementsButton');
    }

    static includeInferredStatements() {
        this.getIncludeInferredStatementsButton().click();
    }

    static getExpandResultsOverSameAsButton() {
        return cy.get('.yasqe_expandResultsButton');
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
