export class JdbcSteps {

    static visit() {
        cy.visit('/jdbc');
    }

    static verifyUrl() {
        cy.url().should('include', '/jdbc');
    }

    static getCreateNewJDBCConfigurationButton() {
        return cy.get('.create-sql-table-configuration');
    }

    static clickOnCreateJdbcConfigurationButton() {
        JdbcSteps.getCreateNewJDBCConfigurationButton().click();
    }

    static getJDBCConfigurations() {
        return cy.get('#configurations-table');
    }

    static getJDBCConfigurationResults(configurationIndex = 0) {
        return JdbcSteps.getJDBCConfigurations(configurationIndex).find('tr');
    }

    static getEditButton(configurationIndex = 0) {
        return JdbcSteps.getJDBCConfigurationResults(configurationIndex).find('.edit-query-btn');
    }

    static clickOnEditButton(configurationIndex = 0) {
        JdbcSteps.getEditButton(configurationIndex).click();
    }

    static getDeleteButton(configurationIndex = 0) {
        return JdbcSteps.getJDBCConfigurationResults(configurationIndex).find('.delete-configuration-btn');
    }

    static clickOnDeleteButton(configurationIndex = 0) {
        JdbcSteps.getDeleteButton(configurationIndex).click();
    }
}
