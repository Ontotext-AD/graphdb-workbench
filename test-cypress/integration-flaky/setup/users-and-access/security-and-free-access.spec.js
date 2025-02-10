import {UserAndAccessSteps} from "../../../steps/setup/user-and-access-steps";
import {RepositoriesStubs} from "../../../stubs/repositories/repositories-stubs";
import {ModalDialogSteps} from "../../../steps/modal-dialog-steps";
import {ToasterSteps} from "../../../steps/toaster-steps";
import {LoginSteps} from "../../../steps/login-steps";

const DEFAULT_ADMIN_PASSWORD = "root";
// Moved out of the standard test suite, because Cypress can't verify Free Access is ON in CI
describe('Security and Free Access', () => {
    beforeEach(() => {
        UserAndAccessSteps.visit();
        cy.window();
        // Users table should be visible
        UserAndAccessSteps.getUsersTable().should('be.visible');
    });

    afterEach(() => {
        UserAndAccessSteps.visit();
        UserAndAccessSteps.getToggleSecurityCheckbox()
            .then(($toggle) => {
                if ($toggle.prop('checked')) {
                    // Uncheck the security toggle button at the end of each test, if it is checked
                    UserAndAccessSteps.toggleSecurity();
                }
            });
    });

    it('should toggle free access after Admin has logged in', () => {
        // Given I have available repositories to allow Free Access for
        RepositoriesStubs.stubRepositories();
        // When I enable security
        UserAndAccessSteps.toggleSecurity();
        // When I log in as an Admin
        LoginSteps.loginWithUser("admin", DEFAULT_ADMIN_PASSWORD);
        // Then the page should load
        UserAndAccessSteps.getSplashLoader().should('not.be.visible');
        UserAndAccessSteps.getUsersTable().should('be.visible');
        // The Free Access toggle should be OFF
        UserAndAccessSteps.getFreeAccessSwitchInput().should('not.be.checked');
        // When I toggle Free Access ON
        UserAndAccessSteps.toggleFreeAccess();
        // Then I click OK in the modal
        ModalDialogSteps.clickOKButton();
        // Then the toggle button should be ON
        UserAndAccessSteps.getFreeAccessSwitchInput().should('be.checked');
        // And I should see a success message
        ToasterSteps.verifySuccess('Free access has been enabled.');
        UserAndAccessSteps.getUsersTable().should('be.visible');
        // When I toggle Free Access OFF
        UserAndAccessSteps.toggleFreeAccess();
        // Then I should see a success message
        ToasterSteps.verifySuccess('Free access has been disabled.');
    });
});
