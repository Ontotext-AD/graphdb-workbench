import {UserAndAccessSteps} from "../../../steps/setup/user-and-access-steps";
import {MainMenuSteps} from "../../../steps/main-menu-steps";

function validateInitialState() {
    UserAndAccessSteps.getCreateNewUserButton().should('be.visible');
    UserAndAccessSteps.getToggleSecuritySwitch().should('be.visible');
    UserAndAccessSteps.getUsersTable().should('be.visible');
}

describe('Users and Access initial state', () => {
    it('Should display the correct initial state when navigating via URL', () => {
        // Given, I visit the Users and Access page via URL
        UserAndAccessSteps.visit();
        // Then,
        validateInitialState();
    });

    it('Should display the correct initial state when navigating via the navigation menu', () => {
        // Given, I visit the Users and Access page via the navigation menu
        UserAndAccessSteps.visit();
        MainMenuSteps.clickOnUsersAndAccess();
        // Then,
        validateInitialState();
    });
})
