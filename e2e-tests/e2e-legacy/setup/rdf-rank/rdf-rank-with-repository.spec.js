import HomeSteps from "../../../steps/home-steps";
import {MainMenuSteps} from "../../../steps/main-menu-steps";
import {RdfRankSteps} from "../../../steps/setup/rdf-rank-steps";

describe('RDF Rank with selected repository', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'rdf-rank-init-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should display the correct initial state when navigating via URL', () => {
        // Given, I visit the RDF Rank page via URL with a repository selected
        RdfRankSteps.visit();
        // Then,
        verifyInitialStateWithSelectedRepository();
    });

    it('Should display the correct initial state when navigating via the navigation bar', () => {
        // Given, I visit the RDF Rank page via the navigation menu with a repository selected
        HomeSteps.visit();
        MainMenuSteps.clickOnRDFRank();
        // Then,
        verifyInitialStateWithSelectedRepository();
    });

    const verifyInitialStateWithSelectedRepository = () => {
        RdfRankSteps.getRDFRankPage().should('be.visible');
        RdfRankSteps.getRDFRankContent().should('be.visible');
        RdfRankSteps.getRDFRankLabel().should('be.visible');
        RdfRankSteps.getRDFRandComputeButton().should('be.visible');
        RdfRankSteps.getFilter().should('be.visible');
    };
})
