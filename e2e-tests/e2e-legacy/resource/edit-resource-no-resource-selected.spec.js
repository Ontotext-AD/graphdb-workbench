import {ResourceSteps} from '../../steps/resource/resource-steps';
import {ApplicationSteps} from '../../steps/application-steps';

describe('Edit resource without a resource', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'edit-resource-no-resource-selected-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('should show a message when no resource is selected', () => {
        // When I open the edit resource page without a resource
        ResourceSteps.visitEdit();
        // Then I see that no resource is selected
        ResourceSteps.getNoResourceSelectedMessage()
            .should('be.visible')
            .and('have.text', 'No resource selected. Open a resource and click Edit.');
        // And no notification is shown
        ApplicationSteps.getNotifications().should('not.exist');
    });
});
