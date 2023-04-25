import {SparqlEditorSteps} from "../../../steps/sparql-editor-steps";
import {YasguiSteps} from "../../../steps/yasgui/yasgui-steps";
import {YasqeSteps} from "../../../steps/yasgui/yasqe-steps";
import {QueryStubDescription, QueryStubs} from "../../../stubs/yasgui/query-stubs";

describe('Expand results over owl:sameAs', () => {

    let repositoryId;

    beforeEach(() => {
        repositoryId = 'sparql-editor-' + Date.now();
        QueryStubs.stubQueryCountResponse();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        cy.intercept(`/repositories/${repositoryId}`, {fixture: '/graphql-editor/default-query-response.json'}).as('query');

        SparqlEditorSteps.visitSparqlEditorPage();
        YasguiSteps.getYasgui().should('be.visible');
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should be able to toggle expand results parameter', () => {
        const queryDescription = new QueryStubDescription()
            .setRepositoryId(repositoryId)
            .setTotalElements(1);
        QueryStubs.stubQueryResults(queryDescription);
        // When I open the editor
        // Then I expect that expand results should be enabled by default
        YasqeSteps.getExpandResultsOverSameAsButtonTooltip().should('have.attr', 'data-tooltip', 'Expand results over owl:sameAs: ON');
        YasqeSteps.getExpandResultsOverSameAsButton().should('have.class', 'icon-same-as-on');
        YasqeSteps.executeQuery();
        cy.wait('@query-1_0_1001_1').its('request.body').should('contain', 'sameAs=true');
        // When I disable the expand results action
        YasqeSteps.expandResultsOverSameAs();
        // Then I expect that the button state should be changed
        YasqeSteps.getExpandResultsOverSameAsButtonTooltip().should('have.attr', 'data-tooltip', 'Expand results over owl:sameAs: OFF');
        YasqeSteps.getExpandResultsOverSameAsButton().should('have.class', 'icon-same-as-off');
        // And sameAs=false parameter should be sent with the request
        YasqeSteps.executeQuery();
        cy.wait('@query-1_0_1001_1').its('request.body').should('contain', 'sameAs=false');
        YasqeSteps.expandResultsOverSameAs();
        // When I disable the include inferred action
        YasqeSteps.includeInferredStatements();
        // Then I expect that sameAs should be disabled too
        YasqeSteps.getExpandResultsOverSameAsButtonTooltip().should('have.attr', 'data-tooltip', 'Requires \'Include Inferred\'!');
        YasqeSteps.getExpandResultsOverSameAsButton().should('have.class', 'icon-same-as-off');
        YasqeSteps.executeQuery();
        cy.wait('@query-1_0_1001_1').its('request.body').should('contain', 'infer=false&sameAs=false');
    });
});
