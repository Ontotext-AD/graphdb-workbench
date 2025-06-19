import {RdfRankSteps} from "../../steps/setup/rdf-rank-steps";

describe('RDF Rank view', () => {

    let repositoryId;

    beforeEach(() => {
        repositoryId = 'rdfrank-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        RdfRankSteps.visit();
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should allow to enable the RDF rank', () => {
        RdfRankSteps.waitUntilRdfRankPageIsLoaded();

        RdfRankSteps.getRdfStatusHeader().should('be.visible').and('contain', repositoryId);
        RdfRankSteps.getRdfStatusTags().should('contain', 'RDFRank not built yet')
            .and('have.class', 'tag-warning');
        RdfRankSteps.getFilteringSwitchInput().should('not.be.checked');

        RdfRankSteps.computeRdfRank();

        RdfRankSteps.getRdfStatusTags().contains('Computed').closest('.tag')
            .should('be.visible')
            .and('have.class', 'tag-success');
    });

    it('Should allow to enable the RDF rank with graphs and predicates filters', () => {
        RdfRankSteps.waitUntilRdfRankPageIsLoaded();

        RdfRankSteps.computeRdfRank();

        // Wait until index is built
        RdfRankSteps.getRdfStatusTags()
            .contains('Computed')
            .closest('.tag')
            .should('be.visible');

        // Enable filtering for ranks
        RdfRankSteps.enableFiltering();
        RdfRankSteps.getFilteringSwitchInput().should('be.checked');

        // Should render that rebuild is required
        RdfRankSteps.getRdfStatusTags()
            .contains('Configuration changed')
            .closest('.tag')
            .should('be.visible')
            .and('have.class', 'tag-warning');

        // Should render filter configuration and the config tabs
        RdfRankSteps.getFilteringConfig().should('be.visible');
        RdfRankSteps.getIncludeExplicitSwitch()
            .should('be.visible')
            .find('input')
            .should('be.checked');
        RdfRankSteps.getIncludeImplicitSwitch()
            .should('be.visible')
            .find('input')
            .should('be.checked');
        // Should have two filter configuration tabs
        RdfRankSteps.getFilteringConfigTabs()
            .find('.nav-link')
            .should('be.visible')
            .and('have.length', 2)
            .and('contain', 'Graphs')
            .and('contain', 'Predicates');

        // The graphs filter config should be the default tab
        RdfRankSteps.getGraphsConfigTab().should('have.class', 'active');

        // And contain filter fields for exclusion/inclusion
        RdfRankSteps.getIncludedGraphsFilter().should('be.visible');
        RdfRankSteps.getExcludedGraphsFilter().should('be.visible');
        // The second tab fields should not be visible
        RdfRankSteps.getIncludedPredicatesFilter().should('not.be.visible');
        RdfRankSteps.getExcludedPredicatesFilter().should('not.be.visible');

        // Open predicates configuration, the filters should change
        RdfRankSteps.openPredicatesConfigTab();
        RdfRankSteps.getIncludedGraphsFilter().should('not.be.visible');
        RdfRankSteps.getExcludedGraphsFilter().should('not.be.visible');
        RdfRankSteps.getIncludedPredicatesFilter().should('be.visible');
        RdfRankSteps.getExcludedPredicatesFilter().should('be.visible');

        const rdfTypePredicate = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
        const invalidPredicate = 'www.w3.org/1999/02/22-rdf-syntax-ns'; // Not an IRI

        // Try to enter invalid IRI -> an error toast should appear
        RdfRankSteps.getIncludedPredicatesFilter()
            .find('input')
            .type(invalidPredicate)
            .type('{enter}');
        RdfRankSteps.getIncludedPredicatesFilter()
            .find('.tag-list .tag-item')
            .should('have.length', 0);
        RdfRankSteps.getToast()
            .find('.toast-error')
            .should('be.visible')
            .and('contain', 'is not a valid IRI');

        // Enter valid one and rebuild
        RdfRankSteps.getIncludedPredicatesFilter()
            .find('input')
            .type(rdfTypePredicate)
            .type('{enter}');
        RdfRankSteps.getIncludedPredicatesFilter()
            .find('.tag-list .tag-item')
            .should('have.length', 1)
            .and('contain', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
        RdfRankSteps.getComputeFullButton().click();

        // All should be OK
        RdfRankSteps.getRdfStatusTags()
            .contains('Computed')
            .closest('.tag')
            .should('be.visible')
            .and('have.class', 'tag-success');
    });
});
