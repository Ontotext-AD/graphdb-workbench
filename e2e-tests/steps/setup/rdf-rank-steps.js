import {BaseSteps} from "../base-steps";

export class RdfRankSteps extends BaseSteps {
    static visit() {
        cy.visit('/rdfrank');
    }

    static getRdfRankView() {
        return cy.get('#rdfRank');
    }

    static waitUntilRdfRankPageIsLoaded() {
        // No active loader
        cy.get('.ot-loader').should('not.exist');

        // Repository is active
        cy.get('.repository-errors').should('not.be.visible');

        this.getRdfRankPage().find('.alert-warning').should('not.be.visible');

        this.getFilteringSwitch().scrollIntoView().should('be.visible');
    }

    static getRdfRankPage() {
        return cy.get('#rdfRank');
    }

    static getRDFRankPage() {
        return this.getByTestId('rdf-rank-page');
    }

    static getRDFRankContent() {
        return this.getRDFRankPage().getByTestId('rdf-rank-content');
    }

    static getRDFRankLabel() {
        return this.getRDFRankPage().getByTestId('rdf-rank-status-label');
    }

    static getRDFRandComputeButton() {
        return this.getRDFRankPage().getByTestId('compute-rdf-rank-btn');
    }

    static getFilter() {
        return this.getRdfRankPage().getByTestId('filter-content');
    }

    static getRdfStatusHeader() {
        return this.getRdfRankPage().find('#toggleIndex');
    }

    static getRdfStatusTags() {
        return this.getRdfStatusHeader().find('.tag');
    }

    static getComputeFullButton() {
        return this.getRdfStatusHeader().find('.compute-rdf-rank-btn');
    }

    static computeRdfRank() {
        this.getComputeFullButton().click();
    }

    static getFilteringMode() {
        return this.getRdfRankPage().find('#toggleFilterMode');
    }

    static getFilteringSwitch() {
        return this.getFilteringMode().find('.rdf-rank-filter-switch');
    }

    static getFilteringSwitchInput() {
        return this.getFilteringSwitch().find('input');
    }

    static enableFiltering() {
        this.getFilteringSwitch().click();
    }

    static getFilteringConfig() {
        return this.getRdfRankPage().find('#filterConfig');
    }

    static getIncludeExplicitSwitch() {
        return this.getFilteringConfig().find('#toggleIncludeExplicit');
    }

    static getIncludeImplicitSwitch() {
        return this.getFilteringConfig().find('#toggleIncludeImplicit');
    }

    static getFilteringConfigTabs() {
        return this.getFilteringConfig().find('.nav li');
    }

    static getGraphsConfigTab() {
        return this.getFilteringConfigTabs().eq(0);
    }

    static getPredicatesConfigTab() {
        return this.getFilteringConfigTabs().eq(1);
    }

    static openPredicatesConfigTab() {
        this.getPredicatesConfigTab().find('.nav-item').click();
    }

    static getIncludedGraphsFilter() {
        return this.getFilteringConfig().find('.included-graphs-filter');
    }

    static getExcludedGraphsFilter() {
        return this.getFilteringConfig().find('.excluded-graphs-filter');
    }

    static getIncludedPredicatesFilter() {
        return this.getFilteringConfig().find('.included-predicates-filter');
    }

    static getExcludedPredicatesFilter() {
        return this.getFilteringConfig().find('.excluded-predicates-filter');
    }
}
