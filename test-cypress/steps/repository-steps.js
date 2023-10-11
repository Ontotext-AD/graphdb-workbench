import {REPOSITORIES_URL} from "../support/repository-commands";

export class RepositorySteps {

    static visit() {
        cy.intercept('/rest/locations?filterClusterLocations=true').as('getLocations');
        cy.intercept(REPOSITORIES_URL + 'all').as('getRepositories');
        cy.visit('/repository');
        RepositorySteps.waitLoader();
        cy.wait('@getLocations');
        // cy.window();
        RepositorySteps.waitUntilRepositoriesPageIsLoaded();
    }

    static getCreateRepositoryButton() {
        return cy.get('#wb-repositories-addRepositoryLink');
    }

    static waitUntilRepositoriesPageIsLoaded() {
        // Workbench loading screen should not be visible
        cy.get('.ot-splash').should('not.be.visible');

        RepositorySteps.getRepositoriesDropdown().should('not.be.disabled');
        RepositorySteps.getCreateRepositoryButton().should('be.visible').and('not.be.disabled');
    }

    static getRepositoriesDropdown() {
        return cy.get('#repositorySelectDropdown')
            .scrollIntoView()
            .should('be.visible');
    }

    static getRepositoriesList() {
        return cy.get('#wb-repositories-repositoryInGetRepositories');
    }

    static getRepositoryFromList(repository) {
        RepositorySteps.waitLoader();
        return RepositorySteps.getRepositoriesList()
            .find('.repository')
            .contains(repository)
            // Return the whole repo row
            .closest('.repository');
    }

    static waitLoader() {
        cy.get('.ot-loader').should('not.be.visible');
    }

    static getRepositoryConnectionOffBtn(id) {
        return RepositorySteps.getRepositoryFromList(id).find('.icon-connection-off');
    }

    static getRepositoryConnectionOnBtn(id) {
        return RepositorySteps.getRepositoryFromList(id).find('.icon-connection-on');
    }

    static clickRepositoryIcon(repositoryId, selector) {
        RepositorySteps.getRepositoryFromList(repositoryId)
            .should('be.visible')
            .find(selector)
            // Forcefully clicking it due to https://github.com/cypress-io/cypress/issues/695
            .should('be.visible')
            .and('not.be.disabled')
            .click({force: true});
    }

    static editRepository(repositoryId) {
        RepositorySteps.clickRepositoryIcon(repositoryId, '.repository-actions .edit-repository-btn');
    }

    static getRepositoryTypeDropdown() {
        return cy.get('#type');
    }

    static restartRepository(repositoryId) {
        RepositorySteps.clickRepositoryIcon(repositoryId, '.repository-actions .restart-repository-btn');
    }

    static createRepository() {
        RepositorySteps.getCreateRepositoryButton().click();
    }

    static getRepositoryTypeButton(type) {
        if (type) {
            return cy.get('#repository-type-' + type + '-btn');
        } else {
            return cy.get('.create-repo-btn').first();
        }
    }

    static chooseRepositoryType(type) {
        RepositorySteps.getRepositoryTypeButton(type).click();
    }

    static getGDBRepositoryTypeButton() {
       return RepositorySteps.getRepositoryTypeButton('gdb');
    }

    static getRepositoryCreateForm() {
        return cy.get('#newRepoForm').should('be.visible');
    }

    static getRepositoryIdField() {
        return RepositorySteps.getRepositoryCreateForm().find('#id');
    }

    static typeRepositoryId(id) {
        RepositorySteps.getRepositoryIdField().type(id);
    }

    static getRepositoryTitleField() {
        return RepositorySteps.getRepositoryCreateForm().find('#title');
    }

    static typeRepositoryTitle(title) {
        RepositorySteps.getRepositoryTitleField().clear().type(title);
    }

    static getRepositoryRulesetMenu() {
        return RepositorySteps.getRepositoryCreateForm().find('#ruleset');
    }

    static getAdditionalPropertiesTextArea() {
        return RepositorySteps.getRepositoryCreateForm().find('#additionalProperties');
    }

    static getRepositoryDisableSameAsCheckbox() {
        return RepositorySteps.getRepositoryCreateForm().find('#disableSameAs');
    }

    static getRepositoryBaseURLField() {
        return RepositorySteps.getRepositoryCreateForm().find('#baseURL');
    }

    static typeRepositoryBaseURL(baseURL) {
        return RepositorySteps.getRepositoryBaseURLField().clear().type(baseURL);
    }

    static getRepositoryContextIndexCheckbox() {
        return RepositorySteps.getRepositoryCreateForm().find('#enableContextIndex');
    }

    static getRepositoryFtsCheckbox() {
        return RepositorySteps.getRepositoryCreateForm().find('#enableFtsIndex');
    }

    static getSaveRepositoryButton() {
        return cy.get('#addSaveRepository');
    }

    static saveRepository() {
        RepositorySteps.getSaveRepositoryButton().click();
        RepositorySteps.waitLoader();
    }

    static selectRepoFromDropdown(repositoryId) {
        RepositorySteps.getRepositoriesDropdown()
            .click()
            .find('.dropdown-menu-right .dropdown-item')
            .contains(repositoryId)
            .closest('a')
            // Force the click because Cypress sometimes determines that the item has 0x0 dimensions
            .click({force: true});
    }

    static getSHACLRepositoryCheckbox() {
        return cy.get('#isShacl');
    }

    static confirmModal() {
        cy.get('.modal')
            .should('be.visible')
            .and('not.have.class', 'ng-animate')
            .find('.modal-footer .btn-primary')
            .click();
    }

    static getOntopContentConfiguration() {
        return cy.get('#ontop-content');
    }

    static getOntopFunctionalityDisabledMessage() {
        return cy.get('.repository-errors div.alert')
            .should('be.visible')
            .and('contain', 'Some functionalities are not available because')
            .and('contain', ' is read-only Virtual Repository');
    }

    static getLocationsList() {
        return cy.get('#wb-locations-locationInGetLocations')
            .find('tr.location')
            .should('have.length', 1)
            .and('contain', 'Repositories from: ')
            .and('contain', 'Local');
    }
}
