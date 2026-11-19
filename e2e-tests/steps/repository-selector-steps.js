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

    /**
     * Verifies that the selected repository is in the URL. Adding it to the URL is a navigation that does not show the
     * layout loader, and the navbar closes an opened submenu when it ends, so call this before using the menu.
     */
    static verifyRepositoryInUrl(repositoryId) {
        cy.location('search').should('contain', `repositoryId=${repositoryId}`);
    }

    static getRepositorySelection() {
        return cy.getByTestId('onto-repository-selector').getByTestId('repository-selection');
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

    static getRepositoryFedxDeprecatedTag(repositoryId) {
        return RepositorySelectorSteps.getRepositoryItem(repositoryId).getByTestId('repository-selector-fedx-deprecated-tag');
    }

    static getRepositoryTooltip() {
        return cy.get('.onto-tooltip-box onto-repository-info');
    }

    static getRepositoryTooltipPart(name) {
        return RepositorySelectorSteps.getRepositoryTooltip().find(`[data-test="repository-info-${name}"]`);
    }
}
