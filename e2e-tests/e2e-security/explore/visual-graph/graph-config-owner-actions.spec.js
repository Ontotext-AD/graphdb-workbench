import {LoginSteps} from "../../../steps/login-steps";
import {HeaderSteps} from "../../../steps/header-steps";
import {MainMenuSteps} from "../../../steps/main-menu-steps";
import {VisualGraphSteps} from "../../../steps/visual-graph-steps";
import {ActiveRepositoryWidgetSteps} from "../../../steps/widgets/active-repository-widget-steps";

describe('Graph config owner actions', () => {
    const password = 'Admin123!';
    let repositoryId;
    let username;
    let graphConfigName;

    beforeEach(() => {
        repositoryId = 'graph-config-owner-' + Date.now();
        username = 'graph-config-user-' + Date.now();
        graphConfigName = 'graph-config-owner-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        cy.createUser({username, password}, true);
        cy.switchOnSecurity();
        cy.loginAsAdmin();
        cy.createGraphConfig(graphConfigName, repositoryId, true);
    });

    afterEach(() => {
        cy.loginAsAdmin();
        cy.switchOffSecurity(true);
        cy.deleteGraphConfig(graphConfigName);
        cy.deleteUser(username);
        cy.deleteRepository(repositoryId);
    });

    it('should show edit and delete for own graph configs after switching users', () => {
        // Given I am logged in as a basic user
        LoginSteps.visitLoginPage();
        LoginSteps.loginWithUser(username, password);
        // Wait for the home page to load for the basic user. Cypress is fast and would log out before the page has
        // loaded, so the page would never have the basic user and the test would not reproduce the problem.
        ActiveRepositoryWidgetSteps.getActiveRepository().should('contain.text', repositoryId);
        // And I log out
        HeaderSteps.logout();

        // When I log in as admin, without reloading the page
        LoginSteps.loginWithUser('admin', 'root');
        // And I open the Visual Graph page from the main menu
        MainMenuSteps.clickOnVisualGraph();

        // Then I expect to see the edit and delete buttons of the graph config I own
        VisualGraphSteps.getEditConfigButton(graphConfigName).should('be.visible');
        VisualGraphSteps.getDeleteConfigButton(graphConfigName).should('be.visible');
    });
});
