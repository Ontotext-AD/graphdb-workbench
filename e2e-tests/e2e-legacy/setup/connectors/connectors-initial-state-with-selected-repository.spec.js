import {ConnectorsSteps} from "../../../steps/setup/connectors-steps";
import HomeSteps from "../../../steps/home-steps";
import {MainMenuSteps} from "../../../steps/main-menu-steps";

const expectedButtons = ['elasticsearch', 'opensearch', 'solr', 'lucene', 'kafka', 'chatgpt-retrieval'];

function verifyConnectorsPage() {
    expectedButtons.forEach(buttonId => {
        ConnectorsSteps.getConnectorButton(buttonId).should('be.visible');
    });
    ConnectorsSteps.getReloadAllButton().should('be.visible');
}

describe('Connectors initial state with repositories', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'connectors-init-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should display the correct initial state when navigating via URL', () => {
        // Given, I visit the Connectors page via URL without a repository selected
        ConnectorsSteps.visit();
        // Then,
        verifyConnectorsPage();
    });

    it('Should display the correct initial state when navigating via the navigation menu', () => {
        // Given, I visit the Connectors page via the navigation menu without a repository selected
        HomeSteps.visit();
        MainMenuSteps.clickOnConnectors();
        // Then,
        verifyConnectorsPage();
    });
});
