export class RepositorySelectorSteps {

    static getRepositorySelectorDropdown() {
        return cy.get('#repositorySelectDropdown');
    }

    static getRepositorySelectorsButton() {
        return RepositorySelectorSteps.getRepositorySelectorDropdown().find('#btnReposGroup');
    }
    static openRepositorySelectors() {
        RepositorySelectorSteps.getRepositorySelectorsButton().click();
    }

    static getRepositorySelectorButton(repositoryId) {
        return RepositorySelectorSteps.getRepositorySelectorDropdown().find('.dropdown-menu .multiline-text').contains(repositoryId);
    }

    static selectRepository(repositoryId) {
        RepositorySelectorSteps.openRepositorySelectors();
        RepositorySelectorSteps.getRepositorySelectorButton(repositoryId).click();
    }

    static getSelectedRepository() {
        return RepositorySelectorSteps.getRepositorySelectorDropdown().find('.active-repository');
    }
}
