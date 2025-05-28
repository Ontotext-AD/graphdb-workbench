import {MainMenuSteps} from "../../../steps/main-menu-steps";
import HomeSteps from "../../../steps/home-steps";
import {VisualGraphSteps} from "../../../steps/visual-graph-steps";

describe('Visual Graph with selected repository', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'visual-graph-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should render Visual Graph with selected repository via URL', () => {
        // Given, I visit the Visual Graph page via URL and I have a selected repository
        VisualGraphSteps.visit();
        // Then, I expect to see the Visual Graph with the classes and relationships
        verifyVisualGraphWithSelectedRepository();
    });

    it('Should render Visual Graph with selected repository via navigation menu', () => {
        // Given, I visit the Visual Graph page via navigation menu and I have a selected repository
        HomeSteps.visit();
        MainMenuSteps.clickOnVisualGraph();
        // Then, I expect to see the Visual Graph with the classes and relationships
        verifyVisualGraphWithSelectedRepository();
    });
});

function verifyVisualGraphWithSelectedRepository() {
    VisualGraphSteps.getSearchField().should('be.visible');
    VisualGraphSteps.getGraphConfigurationsArea().should('be.visible');
    VisualGraphSteps.getSavedGraphsArea().should('be.visible');
}
