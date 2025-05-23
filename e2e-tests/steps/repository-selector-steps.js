export class RepositorySelectorSteps {

    static getRepositorySelectorDropdown() {
        return cy.get('.onto-repository-selector');
    }

    static getRepositorySelectorsButton() {
        return RepositorySelectorSteps.getRepositorySelectorDropdown().find('.onto-dropdown-button .selector-button');
    }
    static openRepositorySelectors() {
        RepositorySelectorSteps.getRepositorySelectorsButton().click();
    }

    static getRepositorySelectorButton(repositoryId) {
        return RepositorySelectorSteps.getRepositorySelectorDropdown().find('.repository-selector-dropdown-item .repository-id').contains(repositoryId);
    }

    static selectRepository(repositoryId) {
        RepositorySelectorSteps.openRepositorySelectors();
        RepositorySelectorSteps.getRepositorySelectorButton(repositoryId).click();
    }

    static getSelectedRepository() {
        return RepositorySelectorSteps.getRepositorySelectorDropdown().find('.active-repository');
    }
}
