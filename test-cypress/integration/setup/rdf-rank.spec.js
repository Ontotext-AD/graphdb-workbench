describe('Setup / RDF Rank', () => {

    let repositoryId;

    function createRepository() {
        repositoryId = 'rdfrank-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
    }

    function waitUntilRdfRankPageIsLoaded() {
        // Workbench loading screen should not be visible
        cy.get('.ot-splash').should('not.be.visible');

        // No active loader
        cy.get('.ot-loader').should('not.exist');

        getRdfRankPage().find('.alert-warning').should('not.be.visible');

        getFilteringSwitch().scrollIntoView().should('be.visible');
    }

    beforeEach(() => {
        createRepository();
        cy.visit('/rdfrank');
        cy.window();
        waitUntilRdfRankPageIsLoaded();
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('should allow to enable the RDF rank', () => {
        getRdfStatusHeader()
            .find('.rdf-rank-status')
            .should('be.visible')
            .and('contain', repositoryId);
        getRdfStatusTags()
            .contains('RDFRank not built yet')

            .should('be.visible')
            .and('have.class', 'tag-warning');
        getFilteringSwitch()
            .find('input')
            .should('not.be.checked');

        getComputeFullButton().click();

        getRdfStatusTags()
            .contains('Computed')
            .closest('.tag')
            .should('be.visible')
            .and('have.class', 'tag-success');
    });

    it('should allow to enable the RDF rank with graphs and predicates filters', () => {
        getComputeFullButton().click();

        // Wait until index is built
        getRdfStatusTags()
            .contains('Computed')
            .closest('.tag')
            .should('be.visible');

        // Enable filtering for ranks
        getFilteringSwitch()
            .click()
            .find('input')
            .should('be.checked');

        // Should render that rebuild is required
        getRdfStatusTags()
            .contains('Configuration changed')
            .closest('.tag')
            .should('be.visible')
            .and('have.class', 'tag-warning');

        // Should render filter configuration and the config tabs
        getFilteringConfig().should('be.visible');
        getIncludeExplicitSwitch()
            .should('be.visible')
            .find('input')
            .should('be.checked');
        getIncludeImplicitSwitch()
            .should('be.visible')
            .find('input')
            .should('be.checked');
        // Should have two filter configuration tabs
        getFilteringConfigTabs()
            .find('.nav-link')
            .should('be.visible')
            .and('have.length', 2)
            .and('contain', 'Graphs')
            .and('contain', 'Predicates');

        // The graphs filter config should be the default tab
        getGraphsConfigTab().should('have.class', 'active');

        // And contain filter fields for exclusion/inclusion
        getIncludedGraphsFilter().should('be.visible');
        getExcludedGraphsFilter().should('be.visible');
        // The second tab fields should not be visible
        getIncludedPredicatesFilter().should('not.be.visible');
        getExcludedPredicatesFilter().should('not.be.visible');

        // Open predicates configuration, the filters should change
        openPredicatesConfigTab();
        getIncludedGraphsFilter().should('not.be.visible');
        getExcludedGraphsFilter().should('not.be.visible');
        getIncludedPredicatesFilter().should('be.visible');
        getExcludedPredicatesFilter().should('be.visible');

        const rdfTypePredicate = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
        const invalidPredicate = 'www.w3.org/1999/02/22-rdf-syntax-ns'; // Not an IRI

        // Try to enter invalid IRI -> an error toast should appear
        getIncludedPredicatesFilter()
            .find('input')
            .type(invalidPredicate)
            .type('{enter}');
        getIncludedPredicatesFilter()
            .find('.tag-list .tag-item')
            .should('have.length', 0);
        getToast()
            .find('.toast-error')
            .should('be.visible')
            .and('contain', 'is not a valid IRI');

        // Enter valid one and rebuild
        getIncludedPredicatesFilter()
            .find('input')
            .type(rdfTypePredicate)
            .type('{enter}');
        getIncludedPredicatesFilter()
            .find('.tag-list .tag-item')
            .should('have.length', 1)
            .and('contain', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
        getComputeFullButton().click();

        // All should be OK
        getRdfStatusTags()
            .contains('Computed')
            .closest('.tag')
            .should('be.visible')
            .and('have.class', 'tag-success');
    });

    function getRdfRankPage() {
        return cy.get('#rdfRank');
    }

    function getRdfStatusHeader() {
        return getRdfRankPage().find('#toggleIndex');
    }

    function getRdfStatusTags() {
        return getRdfStatusHeader().find('.tag');
    }

    function getComputeFullButton() {
        return getRdfStatusHeader().find('.compute-rdf-rank-btn');
    }

    function getFilteringMode() {
        return getRdfRankPage().find('#toggleFilterMode');
    }

    function getFilteringSwitch() {
        return getFilteringMode().find('.rdf-rank-filter-switch');
    }

    function getFilteringConfig() {
        return getRdfRankPage().find('#filterConfig');
    }

    function getIncludeExplicitSwitch() {
        return getFilteringConfig().find('#toggleIncludeExplicit');
    }

    function getIncludeImplicitSwitch() {
        return getFilteringConfig().find('#toggleIncludeImplicit');
    }

    function getFilteringConfigTabs() {
        return getFilteringConfig().find('.nav li');
    }

    function getGraphsConfigTab() {
        return getFilteringConfigTabs().eq(0);
    }

    function getPredicatesConfigTab() {
        return getFilteringConfigTabs().eq(1);
    }

    function openPredicatesConfigTab() {
        getPredicatesConfigTab().find('.nav-item').click();
    }

    function getIncludedGraphsFilter() {
        return getFilteringConfig().find('.included-graphs-filter');
    }

    function getExcludedGraphsFilter() {
        return getFilteringConfig().find('.excluded-graphs-filter');
    }

    function getIncludedPredicatesFilter() {
        return getFilteringConfig().find('.included-predicates-filter');
    }

    function getExcludedPredicatesFilter() {
        return getFilteringConfig().find('.excluded-predicates-filter');
    }

    function getToast() {
        return cy.get('#toast-container');
    }

});
