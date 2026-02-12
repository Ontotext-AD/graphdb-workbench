import {RepositorySelectorSteps} from '../../steps/repository-selector-steps.js';
import {LoginSteps} from '../../steps/login-steps.js';
import {UserAndAccessSteps} from '../../steps/setup/user-and-access-steps.js';
import HomeSteps from '../../steps/home-steps.js';

describe('URL with Repository ID parameter', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'repository-in-url-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
    })

    afterEach(() => {
        cy.loginAsAdmin();
        cy.switchOffSecurity(true);
        cy.deleteRepository(repositoryId);
    });

    it('should set repositoryId in url after enable security->login', () => {
        enableSecurity(repositoryId);
        // When user logs in again
        LoginSteps.loginWithUser('admin', 'root');
        // Then repositoryId parameter should be present in the URL and repository should be selected in the selector
        UserAndAccessSteps.getUsersCatalogContainer().should('be.visible');
        cy.url().should('include', 'repositoryId=' + repositoryId);
        RepositorySelectorSteps.getSelectedRepository().should('contain', repositoryId);
    });

    it('should set repositoryId in ur after first login', () => {
        // Given security is on
        cy.switchOnSecurity();
        // And I log in with user admin
        LoginSteps.visitLoginPage();
        LoginSteps.loginWithUser('admin', 'root');
        // Then repositoryId parameter should be present in the URL and repository should be selected in the selector
        HomeSteps.getView().should('be.visible');
        cy.url().should('include', 'repositoryId=' + repositoryId);
        RepositorySelectorSteps.getSelectedRepository().should('contain', repositoryId);
    });
});

function enableSecurity(repositoryId) {
    // Given security is off
    // When user visits user and access page
    UserAndAccessSteps.visit();
    // Then url should contain repositoryId parameter and repository should be selected in the selector
    cy.url().should('include', 'repositoryId=' + repositoryId);
    RepositorySelectorSteps.getSelectedRepository().should('contain', repositoryId);
    // When user toggles security on
    UserAndAccessSteps.toggleSecurity();
    // Then user should be logged out and login page should be shown
    LoginSteps.getLoginPage().should('be.visible');
    // And repositoryId parameter should not be present in the URL
    cy.url().should('not.include', 'repositoryId=');
}
