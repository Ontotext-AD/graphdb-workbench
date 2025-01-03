export class JdbcCreateSteps {

    static visit(jdbcConfigurationName) {
        cy.visit(`/jdbc/configuration/create${jdbcConfigurationName ? '?name=' + jdbcConfigurationName : ''}`);
        cy.get('.ontotext-yasgui').should('be.visible');
    }

    static verifyUrl() {
        cy.url().should('include', '/jdbc/configuration/create');
    }

    static getJDBCConfigNameField() {
        return cy.get('.jdbc-configuration-name');
    }

    static typeTableName(tableName) {
        // force is needed because ontotext-yasgui is created with focus on editor
        // and if it appears in the middle of templateId typing the last part of template is written in ontotext-yasgui instead input element.
        JdbcCreateSteps.getJDBCConfigNameField().type(tableName, {force: true});
    }

    static getTab(index = 0) {
        return cy.get('.nav-item').eq(index);
    }

    static getActiveTab() {
        return cy.get('.nav-item.active');
    }

    static openDataQueryTab() {
        JdbcCreateSteps.getTab(0).click();
    }

    static openColumnTypesTab() {
        JdbcCreateSteps.getTab(1).click();
    }

    static getSaveButton() {
        return cy.get('.save-query-btn');
    }

    static clickOnSave() {
        JdbcCreateSteps.getSaveButton().click();
    }

    static getCancelButton() {
        return cy.get('.cancel-button');
    }

    static clickOnCancel() {
        JdbcCreateSteps.getCancelButton().click();
    }

    static getPreviewButton() {
        return cy.get('.preview-btn');
    }

    static clickOnPreviewButton() {
        JdbcCreateSteps.getPreviewButton().click();
    }

    static getSuggestButton() {
        return cy.get('.suggest-btn');
    }

    static clickOnSuggestButton() {
        JdbcCreateSteps.getSuggestButton().click();
    }

    static getColumnSuggestionRows() {
        return cy.get('.column-suggestion-row');
    }

    static getColumnSuggestion(columnSuggestionRowIndex = 0) {
        return JdbcCreateSteps.getColumnSuggestionRows().eq(columnSuggestionRowIndex);
    }

    static getColumnDeleteButton(columnSuggestionRowIndex = 0) {
        return JdbcCreateSteps.getColumnSuggestion(columnSuggestionRowIndex).find('.delete-column-btn');
    }

    static clickOnDeleteColumnButton(columnSuggestionRowIndex = 0) {
        JdbcCreateSteps.getColumnDeleteButton(columnSuggestionRowIndex).click();
    }

    static getJdbcConfigurationNameIsRequired() {
        return cy.get('.jdbc-configuration-name-required');
    }

    static getInvalidQueryMode() {
        return cy.get('.invalid-query-mode');
    }

    static getInvalidQuery() {
        return cy.get('.invalid-query');
    }
}
