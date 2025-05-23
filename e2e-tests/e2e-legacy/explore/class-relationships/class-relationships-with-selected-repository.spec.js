import HomeSteps from "../../../steps/home-steps";
import {MainMenuSteps} from "../../../steps/main-menu-steps";
import {ClassRelationshipsSteps} from "../../../steps/explore/class-relationships-steps";

describe('Class Relationships with selected repository', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'class-relationships-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should render Class Relationships with selected repository via URL', () => {
        // Given, I visit the Class Relationships page via URL and I have a selected repository
        ClassRelationshipsSteps.visit();
        // Then
        validateNoRelationshipsClassRelationshipsPage();
    });

    it('Should render Class Relationships with selected repository via navigation menu', () => {
        // Given, I visit the Class Relationships page via navigation menu and I have a selected repository'
        HomeSteps.visit();
        MainMenuSteps.clickOnClassRelationships();
        // Then
        validateNoRelationshipsClassRelationshipsPage();
    });
});

function validateNoRelationshipsClassRelationshipsPage() {
  ClassRelationshipsSteps.getReloadDiagramButton().should('be.visible');
  ClassRelationshipsSteps.getNoDataWarning()
      .should('be.visible')
      .and('contain', 'The currently selected repository contains no dependencies data. Please, reload the diagram if you have imported data recently.')
}
