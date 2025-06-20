import HomeSteps from "../../../steps/home-steps";
import {MainMenuSteps} from "../../../steps/main-menu-steps";
import {AclManagementSteps} from "../../../steps/setup/acl-management-steps";

function verifyStateWithSelectedRepository() {
    AclManagementSteps.getPageHeading().should('be.visible');
    AclManagementSteps.getAclTable().should('be.visible');
    AclManagementSteps.getNoDataMessage().should('be.visible');
    AclManagementSteps.getAddFirstRuleButton().should('be.visible');
    AclManagementSteps.getAclTabs().should('be.visible').and('have.length', 4);
}

describe('ACL Management initial state with repositories', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'acl-management-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should display the correct initial state when navigating via URL', () => {
        // Given, I visit the ACL Management page via URL with a repository selected
        AclManagementSteps.visit();
        // Then,
        verifyStateWithSelectedRepository();
    });

    it('Should display the correct initial state when navigating via the navigation menu', () => {
        // Given, I visit the ACL Management page via the navigation menu with a repository selected
        HomeSteps.visit();
        MainMenuSteps.clickOnACLManagement();
        // Then,
        verifyStateWithSelectedRepository();
    });
})
