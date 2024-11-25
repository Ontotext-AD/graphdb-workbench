import {TTYGViewSteps} from "../../steps/ttyg/ttyg-view-steps";
import {TTYGStubs} from "../../stubs/ttyg/ttyg-stubs";
import {RepositoriesStubs} from "../../stubs/repositories/repositories-stubs";
import {ModalDialogSteps} from "../../steps/modal-dialog-steps";
import {RepositoriesStub} from "../../stubs/repositories-stub";

describe('TTYG delete agent', () => {
    const repositoryId = 'starwars';

    beforeEach(() => {
        RepositoriesStubs.stubRepositories(0, '/repositories/get-ttyg-repositories.json');
        RepositoriesStub.stubBaseEndpoints(repositoryId);
        cy.presetRepository(repositoryId);
    });

    it('Should be able to delete agent', () => {
        TTYGStubs.stubChatsListGetNoResults();
        TTYGStubs.stubAgentListGet();
        // Given I have opened the ttyg page
        TTYGViewSteps.visit();
        TTYGViewSteps.expandAgentsSidebar();
        TTYGViewSteps.getAgents().should('have.length', 2);
        TTYGViewSteps.filterAgentsByRepository('All');
        TTYGViewSteps.getAgents().should('have.length', 4);
        // When I select the delete agent action
        TTYGViewSteps.triggerDeleteAgentActionMenu(0);
        // Then I should see the delete agent dialog
        ModalDialogSteps.getDialog().should('be.visible');
        ModalDialogSteps.getDialogBody().contains('Do you really want to delete the agent agent-1?');
        // When I cancel the delete agent action
        ModalDialogSteps.cancel();
        // Then the modal dialog should be closed
        ModalDialogSteps.getDialog().should('not.exist');
        // When I select the delete agent action
        TTYGStubs.stubAgentDelete(1000);
        TTYGStubs.stubAgentListGet('/ttyg/agent/get-agent-list-after-deleted.json');
        TTYGViewSteps.triggerDeleteAgentActionMenu(0);
        // And I confirm the delete agent action
        ModalDialogSteps.confirm();
        // Then the modal dialog should be closed
        ModalDialogSteps.getDialog().should('not.exist');
        // And the agent should be deleted
        TTYGViewSteps.getAgentDeletingLoader().should('be.visible');
        TTYGViewSteps.getAgents().should('have.length', 3);
        TTYGViewSteps.verifyAgentList([
            {name: 'agent-2', repositoryId: 'Not existing repo', isRepositoryDeleted: true},
            {name: 'Databricks-general-unbiased', repositoryId: 'starwars', isRepositoryDeleted: false},
            {name: 'Databricks-biomarkers', repositoryId: 'biomarkers', isRepositoryDeleted: false}
        ]);
    });
});
