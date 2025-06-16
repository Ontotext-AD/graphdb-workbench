import HomeSteps from "../../../steps/home-steps";
import {MainMenuSteps} from "../../../steps/main-menu-steps";
import {SimilarityIndexesSteps} from "../../../steps/explore/similarity-indexes-steps";

describe('Similarity indexes with selected repository', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'similarity-index-init-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should display the correct initial state when navigating via URL', () => {
        // Given, I visit the Similarity indexes page via URL with a repository selected
        SimilarityIndexesSteps.visit();
        // Then,
        verifyInitialStateWithSelectedRepository();
    });

    it('Should display the correct initial state when navigating via the navigation bar', () => {
        // Given, I visit the Similarity indexes page via the navigation menu with a repository selected
        HomeSteps.visit();
        MainMenuSteps.clickOnSimilarity();
        // Then,
        verifyInitialStateWithSelectedRepository();
    });

    const verifyInitialStateWithSelectedRepository = () => {

        SimilarityIndexesSteps.getExistingSimilarityIndexes().contains('Select one of your existing indexes to search in it');
        SimilarityIndexesSteps.getCreateButton().should('be.visible');
    };
})
