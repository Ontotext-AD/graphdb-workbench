import {ErrorSteps} from "../../../steps/error-steps";
import HomeSteps from "../../../steps/home-steps";
import {MainMenuSteps} from "../../../steps/main-menu-steps";
import {SimilarityIndexesSteps} from "../../../steps/explore/similarity-indexes-steps";

describe('Similarity indexes without selected repository', () => {
    it('Should display the correct initial state when navigating via URL', () => {
        // Given, I visit the Similarity indexes page via URL without a repository selected
        SimilarityIndexesSteps.visit();
        // Then,
        ErrorSteps.verifyNoConnectedRepoMessage();
    });

    it('Should display the correct initial state when navigating via the navigation menu', () => {
        // Given, I visit the Similarity indexes page via the navigation menu without a repository selected
        HomeSteps.visit();
        MainMenuSteps.clickOnSimilarity();
        // Then,
        ErrorSteps.verifyNoConnectedRepoMessage();
    });
})
