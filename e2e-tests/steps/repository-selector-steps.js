export class RepositorySelectorSteps {

    static getRepositorySelectorDropdown() {
        return cy.get('.onto-repository-selector');
    }

    static getRepositorySelectorsButton() {
        return RepositorySelectorSteps.getRepositorySelectorDropdown().find('.onto-dropdown-button .repository-selection');
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

    static getRepositoryItem(repositoryId) {
        return RepositorySelectorSteps.getRepositorySelectorButton(repositoryId).closest('.onto-dropdown-menu-item');
    }

    static hoverRepositoryItem(repositoryId) {
        RepositorySelectorSteps.getRepositoryItem(repositoryId).realHover();
    }

    static getRepositoryTooltip() {
        return cy.get('.onto-tooltip-box onto-repository-info');
    }

    static getRepositoryTooltipPart(name) {
        return RepositorySelectorSteps.getRepositoryTooltip().find(`[data-test="repository-info-${name}"]`);
    }
}
