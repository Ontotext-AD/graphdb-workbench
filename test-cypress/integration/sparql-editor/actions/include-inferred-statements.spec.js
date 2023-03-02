import {SparqlEditorSteps} from "../../../steps/sparql-editor-steps";
import {YasguiSteps} from "../../../steps/yasgui/yasgui-steps";
import {YasqeSteps} from "../../../steps/yasgui/yasqe-steps";
import {QueryStubDescription, QueryStubs} from "../../../stubs/yasgui/query-stubs";

describe('Include inferred statements', () => {

    let repositoryId;

    beforeEach(() => {
        repositoryId = 'sparql-editor-' + Date.now();
        cy.intercept('GET', '/rest/monitor/query/count', {body: 0});
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        cy.intercept(`/repositories/${repositoryId}`, {fixture: '/graphql-editor/default-query-response.json'}).as('query');

        SparqlEditorSteps.visitSparqlEditorPage();
        YasguiSteps.getYasgui().should('be.visible');
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should be able to toggle include inferred statements', () => {
        const queryDescription = new QueryStubDescription()
            .setRepositoryId(repositoryId)
            .setTotalElements(1);
        QueryStubs.stubQueryResults(queryDescription);
        // When I open the editor
        // Then I expect that include inferred statements should be enabled by default
        YasqeSteps.getIncludeInferredStatementsButtonTooltip().should('have.attr', 'data-tooltip', 'Include inferred data in results: ON');
        YasqeSteps.getIncludeInferredStatementsButton().should('have.class', 'icon-inferred-on');
        YasqeSteps.executeQuery();
        cy.wait('@query-1_0_1001_1').its('request.body').should('contain', 'infer=true');
        YasqeSteps.includeInferredStatements();
        YasqeSteps.getIncludeInferredStatementsButtonTooltip().should('have.attr', 'data-tooltip', 'Include inferred data in results: OFF');
        YasqeSteps.getIncludeInferredStatementsButton().should('have.class', 'icon-inferred-off');
        YasqeSteps.executeQuery();
        cy.wait('@query-1_0_1001_1').its('request.body').should('contain', 'infer=false');
    });
});
