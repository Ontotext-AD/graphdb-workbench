import {RepositoriesStubs} from "../../../stubs/repositories/repositories-stubs";
import {UserAndAccessSteps} from "../../../steps/setup/user-and-access-steps";
import {LoginSteps} from "../../../steps/login-steps";
import {ModalDialogSteps} from "../../../steps/modal-dialog-steps";
import ImportSteps from "../../../steps/import/import-steps";
import {MainMenuSteps} from "../../../steps/main-menu-steps";
import {RepositorySelectorSteps} from "../../../steps/repository-selector-steps";
import {ErrorSteps} from "../../../steps/error-steps";

describe('User and Access', () => {

    let repositoryId1;
    let repositoryId2;
    const graphqlUser = 'graphqlUser';

    beforeEach(() => {
        cy.viewport(1280, 1000);
        RepositoriesStubs.spyGetRepositories();
        repositoryId1 = 'user-access-repo1-' + Date.now();
        repositoryId2 = 'user-access-repo2-' + Date.now();
        cy.createRepository({id: repositoryId1});
        cy.createRepository({id: repositoryId2});
        cy.presetRepository(repositoryId1);
        UserAndAccessSteps.visit();
        // Users table should be visible
        UserAndAccessSteps.getUsersTable().should('be.visible');
    });

    afterEach(() => {
        cy.loginAsAdmin().then(() => {
            cy.deleteRepository(repositoryId1, true);
            cy.deleteRepository(repositoryId2, true);
            cy.deleteUser(graphqlUser, true);
            cy.switchOffFreeAccess(true);
            cy.switchOffSecurity(true);
        });

    });

    it('should restrict page when free access in on', () => {
        // Given: There at least two repositories.
        // When: I enable the security
        UserAndAccessSteps.toggleSecurity();
        LoginSteps.loginWithUser('admin', 'root');
        // And: turn on Free Access
        UserAndAccessSteps.getFreeAccessSwitchInput().should('not.be.checked');
        UserAndAccessSteps.toggleFreeAccess();
        // And: set graphql rights for the second repository when free access is ON
        UserAndAccessSteps.clickFreeWriteAccessRepo(repositoryId2);
        UserAndAccessSteps.clickFreeGraphqlAccessRepo(repositoryId2);
        ModalDialogSteps.clickOKButton();

        // When: I logout
        LoginSteps.logout();
        // And: repository with graphql rights is selected
        RepositorySelectorSteps.selectRepository(repositoryId2);
        // And: I click on the Import menu.
        MainMenuSteps.clickOnMenuImport();

        // Then: I should see the error message, because import view is available only for write access, repositoryId2 has only graphql rights.
        ErrorSteps.verifyError('Some functionalities are not available because you do not have the required repository permissions.')
    });

    it('should restrict the repositories depending on whether free access is enabled and whether the user is logged in', () => {
        // Given: There at least two repositories.
        // When: I enable the security
        UserAndAccessSteps.toggleSecurity();
        LoginSteps.loginWithUser('admin', 'root');
        // And: turn on Free Access
        UserAndAccessSteps.toggleFreeAccess();
        // And: set rights for the second repository when free access is ON
        UserAndAccessSteps.clickFreeWriteAccessRepo(repositoryId2);
        ModalDialogSteps.clickOKButton();

        // When: I logout
        LoginSteps.logout();
        // Then: I should see only repositoryId2, as it is the only one configured for free access
        RepositorySelectorSteps.getRepositorySelectorButton(repositoryId1).should('not.exist');
        RepositorySelectorSteps.getRepositorySelectorButton(repositoryId2).should('exist');

        // When: I log in again with a user who has access to all repositories
        LoginSteps.loginWithUser('admin', 'root');
        // Then: I should see both repositories in the repository selector, because the user has access to all repositories
        RepositorySelectorSteps.getRepositorySelectorButton(repositoryId1).should('exist');
        RepositorySelectorSteps.getRepositorySelectorButton(repositoryId2).should('exist');
    });
});
