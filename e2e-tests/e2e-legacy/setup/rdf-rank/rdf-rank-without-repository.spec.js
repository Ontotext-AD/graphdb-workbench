import {ErrorSteps} from "../../../steps/error-steps";
import HomeSteps from "../../../steps/home-steps";
import {MainMenuSteps} from "../../../steps/main-menu-steps";
import {RdfRankSteps} from "../../../steps/setup/rdf-rank-steps";

describe('Rdf Rank without selected repository', () => {
    it('Should display the correct initial state when navigating via URL', () => {
        // Given, I visit the Rdf Rank page via URL without a repository selected
        RdfRankSteps.visit();
        // Then,
        verifyInitialStateWithoutSelectedRepository();
    });

    it('Should display the correct initial state when navigating via the navigation menu', () => {
        // Given, I visit the Rdf Rank page via the navigation menu without a repository selected
        HomeSteps.visit();
        MainMenuSteps.clickOnRDFRank();
        // Then,
        verifyInitialStateWithoutSelectedRepository();
    });

    const verifyInitialStateWithoutSelectedRepository = () => {
        ErrorSteps.verifyNoConnectedRepoMessage();
        RdfRankSteps.getRDFRankPage().should('exist');
        RdfRankSteps.getRDFRankContent().should('not.be.visible');
        RdfRankSteps.getRDFRankLabel().should('not.be.visible');
        RdfRankSteps.getRDFRandComputeButton().should('not.be.visible');
        RdfRankSteps.getFilter().should('not.be.visible');
    };
})
