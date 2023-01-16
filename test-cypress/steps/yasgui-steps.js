export class YasguiSteps {

    static getYasgui() {
        return cy.get('.yasgui');
    }

    static getTabs() {
        return cy.get('.tab');
    }

    static getCurrentTab() {
        return cy.get('.tab.active');
    }

    static getCreateSavedQueryButton() {
        return cy.get('.yasqe_createSavedQueryButton');
    }

    static createSavedQuery() {
        this.getCreateSavedQueryButton().click();
    }

    static getSaveQueryDialog() {
        return cy.get('.dialog');
    }

    static closeSaveQueryDialog() {
        this.getSaveQueryDialog().find('.close-button').click();
    }

    static cancelSaveQuery() {
        this.getSaveQueryDialog().find('.cancel-button').click();
    }

    static getSaveQueryButton() {
        return this.getSaveQueryDialog().find('.ok-button');
    }

    static saveQuery() {
        this.getSaveQueryButton().click();
    }

    static getQueryField() {
        return this.getSaveQueryDialog().find('#query');
    }

    static writeQuery(query) {
        this.getQueryField().type(query, {parseSpecialCharSequences: false});
    }

    static clearQueryField() {
        this.getQueryField().clear();
    }

    static getQueryNameField() {
        return this.getSaveQueryDialog().find('#queryName');
    }

    static writeQueryName(queryName) {
        this.getQueryNameField().type(queryName);
    }

    static clearQueryNameField() {
        this.getQueryNameField().clear();
    }

    static toggleIsPublic() {
        this.getSaveQueryDialog().find('#publicQuery').click();
    }

    static getErrorsPane() {
        return this.getSaveQueryDialog().find('.alert-danger');
    }

    static getErrors() {
        return this.getErrorsPane().find('.error-message');
    }

    static getShowSavedQueriesButton() {
        return cy.get('.yasqe_showSavedQueriesButton');
    }

    static showSavedQueries() {
        this.getShowSavedQueriesButton().click();
    }

    static getSavedQueriesPopup() {
        return cy.get('.saved-queries-popup');
    }

    static getSavedQueries() {
        return this.getSavedQueriesPopup().find('.saved-query');
    }

    static verifySavedQueries(data) {
        this.getSavedQueries().each((el, index) => {
            cy.wrap(el).should('contain', data[index].queryName);
        })
    }

    static selectSavedQuery(index) {
        this.getSavedQueries().eq(index).find('a').click();
    }

    static getTabQuery(tabIndex) {
        return cy.get('.yasqe .CodeMirror').then((el) => {
            return el[tabIndex].CodeMirror.getValue();
        });
    }
}
