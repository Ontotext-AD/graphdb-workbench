import {TTYGViewSteps} from "../../steps/ttyg/ttyg-view-steps";
import {TTYGStubs} from "../../stubs/ttyg/ttyg-stubs";
import {RepositoriesStubs} from "../../stubs/repositories/repositories-stubs";
import {ModalDialogSteps} from "../../steps/modal-dialog-steps";
import {RepositoriesStub} from "../../stubs/repositories-stub";

describe('TTYG agent select menu', () => {

    const repositoryId = 'starwars';

    beforeEach(() => {
        RepositoriesStubs.stubRepositories(0, '/repositories/get-ttyg-repositories.json');
        RepositoriesStub.stubBaseEndpoints(repositoryId);
        cy.presetRepository(repositoryId);
        TTYGStubs.stubChatsListGetNoResults();
    });

    it('Should list all agents in the menu', () => {
        TTYGStubs.stubAgentListGet();
        // Given I have opened the ttyg page
        TTYGViewSteps.visit();
        // When The page is loaded
        // Then I should see all the agents in the menu
        TTYGViewSteps.verifySelectAgentMenuItems([
            {name: 'agent-1', repositoryId: 'starwars', isRepositoryDeleted: false},
            {name: 'agent-2', repositoryId: 'Not existing repo', isRepositoryDeleted: true},
            {name: 'Databricks-general-unbiased', repositoryId: 'starwars', isRepositoryDeleted: false},
            {name: 'Databricks-biomarkers', repositoryId: 'biomarkers', isRepositoryDeleted: false}
        ]);
    });

    it('should not allow selecting an incompatible agent from the menu', () => {
        TTYGStubs.stubAgentListWithIncompatibleGet();
        // Given: I have opened the ttyg page
        TTYGViewSteps.visit();
        // And: The agent dropdown menu is not visible
        TTYGViewSteps.getAgentsDropdownMenu().should('not.be.visible');
        // And: No agent is currently selected
        TTYGViewSteps.getAgentsMenuToggleButton().should('contain', 'Select an agent');

        // When: I open the agent selection menu
        TTYGViewSteps.openAgentsMenu();
        // Then: I should see that the first agent is marked as incompatible
        TTYGViewSteps.getAgentFromMenu(0)
            .trigger('mouseover')
            .should('have.css', 'cursor', 'not-allowed');

        // When: I attempt to select an incompatible agent from the menu
        TTYGViewSteps.selectAgent(0);
        // Then: The incompatible agent should not be selected
        TTYGViewSteps.getAgentsMenuToggleButton().should('contain', 'Select an agent');
        // And: The dropdown menu should remain open
        TTYGViewSteps.getAgentsDropdownMenu().should('be.visible');
    });

    it('Should be able to select agent from the menu', () => {
        TTYGStubs.stubAgentListGet();
        // Given I have opened the ttyg page
        TTYGViewSteps.visit();
        // When The page is loaded
        // Then I should see no selected agent if no agent was used before (should be stored in the local storage)
        TTYGViewSteps.getAgentsMenuToggleButton().should('contain', 'Select an agent');
        // When I select an agent from the menu
        TTYGViewSteps.openAgentsMenu();
        TTYGViewSteps.selectAgent(2);
        // The selected agent should be rendered in the menu
        TTYGViewSteps.getAgentsMenuToggleButton().should('contain', 'Databricks-general-unbiased')
            .and('contain', 'starwars');
        // And the selected agent should be highlighted in the agents list sidebar
        TTYGViewSteps.getAgent(1).should('have.class', 'selected');
        // When I select another agent from the menu
        TTYGViewSteps.openAgentsMenu();
        TTYGViewSteps.selectAgent(0);
        // The selected agent should be rendered in the menu
        TTYGViewSteps.getAgentsMenuToggleButton().should('contain', 'agent-1')
            .and('contain', 'starwars');
        TTYGViewSteps.getAgent(0).should('have.class', 'selected');
        TTYGViewSteps.getAgent(1).should('not.have.class', 'selected');
    });

    it('Should update the agent select menu when an agent is deleted from the sidebar', () => {
        TTYGStubs.stubChatsListGetNoResults();
        TTYGStubs.stubAgentListGet();
        // Given I have opened the ttyg page
        TTYGViewSteps.visit();
        cy.wait('@get-agent-list');
        // When I delete an agent from the sidebar
        TTYGViewSteps.expandAgentsSidebar();
        TTYGStubs.stubAgentDelete();
        TTYGStubs.stubAgentListGet('/ttyg/agent/get-agent-list-after-deleted.json');
        TTYGViewSteps.selectAllAgentsFilter();
        TTYGViewSteps.triggerDeleteAgentActionMenu(0);
        ModalDialogSteps.confirm();
        ModalDialogSteps.getDialog().should('not.exist');
        // TODO: the agents list filter brakes after deleting an agent!!!
        TTYGViewSteps.selectAllAgentsFilter();
        TTYGViewSteps.getAgents().should('have.length', 3);
        TTYGViewSteps.verifySelectAgentMenuItems([
            {name: 'agent-2', repositoryId: 'Not existing repo', isRepositoryDeleted: true},
            {name: 'Databricks-general-unbiased', repositoryId: 'starwars', isRepositoryDeleted: false},
            {name: 'Databricks-biomarkers', repositoryId: 'biomarkers', isRepositoryDeleted: false}
        ]);
    });

    it('Should mark selected agent as deleted when the agent is deleted from the sidebar', () => {
        TTYGStubs.stubChatsListGetNoResults();
        TTYGStubs.stubAgentListGet();
        // Given I have opened the ttyg page
        TTYGViewSteps.visit();
        cy.wait('@get-agent-list');
        // And I have selected an agent from the menu
        TTYGViewSteps.openAgentsMenu();
        TTYGViewSteps.selectAgent(0);
        TTYGViewSteps.getAgentsMenuToggleButton().should('contain', 'agent-1');
        // When I delete an agent from the sidebar
        TTYGStubs.stubAgentDelete();
        TTYGStubs.stubAgentListGet('/ttyg/agent/get-agent-list-after-deleted.json');
        TTYGViewSteps.filterAgentsByRepository('All');
        TTYGViewSteps.triggerDeleteAgentActionMenu(1);
        ModalDialogSteps.confirm();
        ModalDialogSteps.getDialog().should('not.exist');
        // TODO: the agents list filter brakes after deleting an agent!!!
        TTYGViewSteps.verifySelectAgentMenuItems([
            {name: 'agent-2', repositoryId: 'Not existing repo', isRepositoryDeleted: true},
            {name: 'Databricks-general-unbiased', repositoryId: 'starwars', isRepositoryDeleted: false},
            {name: 'Databricks-biomarkers', repositoryId: 'biomarkers', isRepositoryDeleted: false}
        ]);
    });

    it('Should ask user to configure the agent when it has missing repository', () => {
        TTYGStubs.stubChatsListGetNoResults();
        TTYGStubs.stubAgentListGet();
        // Given I have opened the ttyg page
        TTYGViewSteps.visit();
        cy.wait('@get-agent-list');
        // When I select an agent which has no repository id from the menu
        TTYGViewSteps.openAgentsMenu();
        TTYGViewSteps.selectAgent(1);
        // Then I expect a confirmation dialog to be opened for the user to configure the agent
        ModalDialogSteps.getDialog().should('be.visible');
        // When I cancel the configuration
        ModalDialogSteps.cancel();
        // Then the agent should be selected in the menu immediately
        TTYGViewSteps.getAgentsMenuToggleButton().should('contain', 'agent-2');
        // When I select the agent again
        TTYGViewSteps.openAgentsMenu();
        TTYGViewSteps.selectAgent(0);
        TTYGViewSteps.openAgentsMenu();
        TTYGViewSteps.selectAgent(1);
        ModalDialogSteps.getDialog().should('be.visible');
        // And I confirm that I want to configure the agent
        ModalDialogSteps.confirm();
        // TODO: Next steps should be implemented when agent edit action is implemented
        // TODO: Then I expect that the confirmation dialog is closed
        // TODO: And I expect that the agent edit dialog is opened
        // TODO: When I configure the agent repository and save it
        // TODO: Then I expect that the agent is selected in the menu
        // TODO: And the sgent should have the repository id in the menu
    });

    it.skip('Should load the agent which was last used', () => {

    });
});

