import {BaseSteps} from "../base-steps";

export class JdbcSteps extends BaseSteps {

    static visit() {
        cy.visit('/jdbc');
    }

    static verifyUrl() {
        cy.url().should('include', '/jdbc');
    }

    static getJDBCPage() {
        return this.getByTestId('jdbc-page');
    }

    static getJDBCConfiguration() {
        return this.getJDBCPage().getByTestId('jdbc-configurations');
    }

    static getCreateSQLTableConfigurationButton() {
        return this.getJDBCConfiguration().getByTestId('create-sql-table-configuration');
    }

    static getNoSQLConfigurationsMessage() {
        return this.getJDBCConfiguration().getByTestId('no-sql-configurations-message');
    }

    static clickOnCreateJdbcConfigurationButton() {
        JdbcSteps.getCreateSQLTableConfigurationButton().click();
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
