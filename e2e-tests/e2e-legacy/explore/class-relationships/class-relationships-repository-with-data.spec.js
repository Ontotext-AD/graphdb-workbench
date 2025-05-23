import {ClassRelationshipsSteps} from "../../../steps/explore/class-relationships-steps";
import {MainMenuSteps} from "../../../steps/main-menu-steps";
import HomeSteps from "../../../steps/home-steps";

describe('Class Relationships repository with date', () => {
    let repositoryId

    beforeEach(() => {
        repositoryId = 'class-relationships-date-' + Date.now()
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        cy.importServerFile(repositoryId, 'wine.rdf');
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should render Class Relationships with selected repository via URL', () => {
        // Given, I visit the Class Relationships page via URL and I have a selected repository with data
        ClassRelationshipsSteps.visit();

        // Then
        validateInitialStateWithData();
    });

    it('Should render Class Relationships with selected repository via navigation menu', () => {
        // Given, I visit the Class Relationships page via navigation menu and I have a selected repository with data
        HomeSteps.visit();
        MainMenuSteps.clickOnClassRelationships();

        // Then
        validateInitialStateWithData();
    });
});

function validateInitialStateWithData() {
    ClassRelationshipsSteps.verifyRelationsToolbarContent();
    ClassRelationshipsSteps.getFilterField().should('be.visible');
    ClassRelationshipsSteps.getDependenciesList().should('be.visible');
    ClassRelationshipsSteps.getDependenciesDiagram().should('be.visible');
}
