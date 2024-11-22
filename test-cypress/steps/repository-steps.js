import {REPOSITORIES_URL} from "../support/repository-commands";

export class RepositorySteps {

    static visit() {
        cy.intercept('/rest/locations').as('getLocations');
        cy.intercept(REPOSITORIES_URL + 'all').as('getRepositories');
        cy.visit('/repository');
        RepositorySteps.waitLoader();
        cy.wait('@getLocations');
        // cy.window();
        RepositorySteps.waitUntilRepositoriesPageIsLoaded();
    }

    static visitEditPage(repositoryId) {
        cy.visit(`repository/edit/${repositoryId}?location=`);
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

    static clickRepositoryConnectionOffBtn(id) {
        RepositorySteps.getRepositoryConnectionOffBtn(id).click();
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

    static getEditViewRestartButton() {
        return cy.get('#restartRepo');
    }

    static getRepositoryRestartButton(repositoryId) {
        return RepositorySteps.getRepositoryFromList(repositoryId)
            .should('be.visible')
            .find('.repository-actions .restart-repository-btn');
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

    static getRepositoryIdEditElement() {
        return cy.get('.ot-edit-input');
    }

    static getUsernameFieldEditRepo() {
        return cy.get('.form-group #username');
    }

    static typeUsernameInEditRepo(username) {
        this.getUsernameFieldEditRepo().type(username);
    }

    static clickSaveEditedRepo() {
        cy.get('#addEditOntopRepository').click();
    }

    static typeURL(url) {
        cy.get('#url').type(url);
    }

    static editRepositoryId() {
        this.getRepositoryIdEditElement().click();
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

    static getSparqlOntopicTable() {
        return cy.get('#wb-repositories-ontopic-sparql-repositoryInGetRepositories');
    }

    static getDeleteOntopicInstanceBtn(url) {
        return RepositorySteps.getSparqlOntopicTable().find('tr').contains(url).parent().parent().find('.delete-ontopic-location');
    }

    static deleteOntopicInstance(url) {
        RepositorySteps.getDeleteOntopicInstanceBtn(url).click();
    }

    static getDeleteSparqlInstanceBtn(url) {
        return RepositorySteps.getSparqlOntopicTable().find('tr').contains(url).parent().parent().find('.delete-sparql-location');
    }

    static deleteSparqlLocation(url) {
        RepositorySteps.getDeleteSparqlInstanceBtn(url).click();
    }

    static getEditOntopicInstanceBtn(url) {
        return RepositorySteps.getSparqlOntopicTable().find('tr').contains(url).parent().parent().find('.edit-ontopic-location');
    }

    static editOntopicInstance(url) {
        RepositorySteps.getEditOntopicInstanceBtn(url).click();
    }

    static getEditSparqlInstanceBtn(row) {
        return cy.get('#wb-repositories-ontopic-sparql-repositoryInGetRepositories tbody tr')
            .eq(row)
            .find('.edit-sparql-location');
    }

    static editSparqlInstance(row) {
        RepositorySteps.getEditSparqlInstanceBtn(row).click();
    }

    static getRestartRemoteRepoButton(row) {
        return this.getRemoteGraphDBTable().eq(row).find('.repository-actions .restart-repository-btn');
    }

    static getRemoteGraphDBTable() {
        return cy.get('#wb-locations-locationInGetRemoteLocations');
    }

    static getLocalGraphDBTable() {
        return cy.get('#wb-locations-locationInGetLocations');
    }

    static selectRulesetFile() {
        cy.get('#additionalParams .form-group .selectFiles').click();
    }

    static uploadRulesetFile(file) {
        cy.get('input[type=file]').eq(1).selectFile(file, {force: true});
    }

    static getRepoIcon(type) {
        return this.getLocalGraphDBTable().get(`.lead .icon-repo-${type}`);
    }

    static assertRepositoryStatus(repositoryId, status) {
        RepositorySteps.getRepositoryFromList(repositoryId).as('repo');
        cy.get('@repo').should('be.visible');
        cy.get('@repo').find('.repository-status .text-secondary').contains(status);
    }
}
