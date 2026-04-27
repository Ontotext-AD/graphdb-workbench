import HomeSteps from "../../../steps/home-steps";
import {MainMenuSteps} from "../../../steps/main-menu-steps";
import {AclManagementSteps} from "../../../steps/setup/acl-management-steps";
import {RepositorySteps} from '../../../steps/repository-steps.js';
import {RepositorySelectorSteps} from '../../../steps/repository-selector-steps.js';

function verifyStateWithSelectedRepository() {
    AclManagementSteps.getPageHeading().should('be.visible');
    AclManagementSteps.getAclTable().should('be.visible');
    AclManagementSteps.getNoDataMessage().should('be.visible');
    AclManagementSteps.getAddFirstRuleButton().should('be.visible');
    AclManagementSteps.getAclTabs().should('be.visible').and('have.length', 4);
}

describe('ACL Management initial state with repositories', () => {
    let repositoryId;
    let fedexRepositoryId;

    beforeEach(() => {
        repositoryId = 'acl-management-' + Date.now();
        fedexRepositoryId = 'fedex-repo-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
        cy.deleteRepository(fedexRepositoryId);
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

    it('should prevent ACL management with FedEx repository', () => {
        // Given I have created a Fedex repository
        createFedexRepository(repositoryId, fedexRepositoryId);
        // When I select the fedex repository
        RepositorySelectorSteps.selectRepository(fedexRepositoryId);
        RepositorySelectorSteps.getSelectedRepository().should('contain', fedexRepositoryId);
        RepositorySteps.getActiveRepositoryRow().should('contain', fedexRepositoryId);
        // And I navigate to ACL management page
        MainMenuSteps.clickOnACLManagement();
        // Then I should see the warning message about Fedex repository
        AclManagementSteps.getFedexWarningMessage().should('be.visible');
        AclManagementSteps.getAclManagementContent().should('not.exist');
        // When I switch to graphdb repository
        RepositorySelectorSteps.selectRepository(repositoryId);
        // Then the warning message should be hidden
        AclManagementSteps.getFedexWarningMessage().should('not.exist');
        AclManagementSteps.getAclManagementContent().should('be.visible');
        // When I select a fedex repository
        RepositorySelectorSteps.selectRepository(fedexRepositoryId);
        // Then the fedex warning should become visible
        AclManagementSteps.getFedexWarningMessage().should('be.visible');
        AclManagementSteps.getAclManagementContent().should('not.exist');
        // Go to home page before end to prevent error when delete the repository happens
        HomeSteps.visit();
    });
})

function createFedexRepository(repositoryId, fedexRepositoryId) {
    RepositorySteps.visit();
    RepositorySteps.getCreateRepositoryButton().click();
    RepositorySteps.createFedexRepositoryType();
    cy.url().should('include', '/repository/create/fedx');
    RepositorySteps.typeRepositoryId(fedexRepositoryId);
    RepositorySteps.selectFedexMember(repositoryId);
    RepositorySteps.saveRepository();
    RepositorySteps.getRepositoriesPage().should('be.visible');
    RepositorySteps.getRepositoryFromList(fedexRepositoryId)
        .should('be.visible');
}
