import {MainMenuSteps} from "../../../steps/main-menu-steps";
import HomeSteps from "../../../steps/home-steps";
import {ErrorSteps} from "../../../steps/error-steps";
import {AclManagementSteps} from "../../../steps/setup/acl-management-steps";

describe('ACL Management initial state without repositories', () => {
    it('Should display the correct initial state when navigating via URL', () => {
        // Given, I visit the ACL Management page via URL without repositories selected
        AclManagementSteps.visit();
        // Then,
        ErrorSteps.verifyNoConnectedRepoMessage();
    });

    it('Should display the correct initial state when navigating via the navigation menu', () => {
        // Given, I visit the ACL Management page via the navigation menu without repositories selected
        HomeSteps.visit();
        MainMenuSteps.clickOnACLManagement();
        // Then,
        ErrorSteps.verifyNoConnectedRepoMessage();
    });
});
