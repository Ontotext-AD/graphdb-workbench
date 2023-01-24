export class SaveQueryDialog {
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

    static getIsPublicField() {
        return this.getSaveQueryDialog().find('#publicQuery');
    }

    static getErrorsPane() {
        return this.getSaveQueryDialog().find('.alert-danger');
    }

    static getErrors() {
        return this.getErrorsPane().find('.error-message');
    }
}
