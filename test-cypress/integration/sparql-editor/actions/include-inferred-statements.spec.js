import {SparqlEditorSteps} from "../../../steps/sparql-editor-steps";
import {YasguiSteps} from "../../../steps/yasgui/yasgui-steps";
import {YasqeSteps} from "../../../steps/yasgui/yasqe-steps";
import {QueryStubDescription, QueryStubs} from "../../../stubs/yasgui/query-stubs";
import {SecurityStubs} from "../../../stubs/security-stubs";

describe('Include inferred statements', () => {

    let repositoryId;

    beforeEach(() => {
        repositoryId = 'sparql-editor-' + Date.now();
        QueryStubs.stubQueryCountResponse();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        cy.intercept(`/repositories/${repositoryId}`, {fixture: '/graphql-editor/default-query-response.json'}).as('query');

    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should be able to toggle include inferred statements', () => {
        const queryDescription = new QueryStubDescription()
            .setRepositoryId(repositoryId)
            .setTotalElements(1);
        QueryStubs.stubQueryResults(queryDescription);
        stubInferAndSameAsDefaults(true);

        // When I visit a page with "ontotext-yasgui-web-component" in it,
        SparqlEditorSteps.visitSparqlEditorPage();
        YasguiSteps.getYasgui().should('be.visible');

        // Then I expect that include inferred statements should be enabled by default,
        YasqeSteps.getIncludeInferredStatementsButton().should('have.class', 'icon-inferred-on');
        // and the tooltip of element describes that "infer" functionality is enabled.
        YasqeSteps.getIncludeInferredStatementsButtonTooltip().should('have.attr', 'data-tooltip', 'Include inferred data in results: ON');

        // When I execute a query.
        YasqeSteps.executeQuery();

        // Then I expect the request body contains property "infer" with value true.
        cy.wait('@query-1_0_1001_1').its('request.body').should('contain', 'infer=true');

        // When I disable "infer".
        YasqeSteps.includeInferredStatements();

        // Then I expect the include inferred statements should be enabled by default,
        YasqeSteps.getIncludeInferredStatementsButton().should('have.class', 'icon-inferred-off');
        // and the tooltip of element describes that "infer" functionality is disabled.
        YasqeSteps.getIncludeInferredStatementsButtonTooltip().should('have.attr', 'data-tooltip', 'Include inferred data in results: OFF');

        // When I execute a query.
        YasqeSteps.executeQuery();

        // Then I expect the request body contains property "infer" with value false.
        cy.wait('@query-1_0_1001_1').its('request.body').should('contain', 'infer=false');
    });

    describe('infer configuration', () => {

        it('should be enabled when user settings is set to true.', () => {
            stubInferAndSameAsDefaults(true);

            // When I visit a page with "ontotext-yasgui-web-component" in it.
            SparqlEditorSteps.visitSparqlEditorPage();
            YasguiSteps.getYasgui().should('be.visible');

            // Then I expect that "infer" element to be enabled by default,
            YasqeSteps.getActionButton(3).should('have.class', 'icon-inferred-on');
            // and the tooltip of element describes that "infer" functionality is enabled.
            YasqeSteps.getActionButtonTooltip(3).should('have.attr', 'data-tooltip', 'Include inferred data in results: ON');

            // When I open a new Tab.
            YasguiSteps.openANewTab();

            // Then I expect that inferred element to be enabled in the new tab,
            YasqeSteps.getActionButton(3).should('have.class', 'icon-inferred-on');
            // and the tooltip of element describes that "infer" element is enabled.
            YasqeSteps.getActionButtonTooltip(3).should('have.attr', 'data-tooltip', 'Include inferred data in results: ON');
        });

        it('should not be enabled when user settings is set to false.', () => {
            stubInferAndSameAsDefaults(false);

            // When I visit a page with "ontotext-yasgui-web-component" in it.
            SparqlEditorSteps.visitSparqlEditorPage();
            YasguiSteps.getYasgui().should('be.visible');

            // Then I expect that "infer" element to be disabled by default,
            YasqeSteps.getActionButton(3).should('have.class', 'icon-inferred-off');
            // and the tooltip of element describes that "infer" element is disabled.
            YasqeSteps.getActionButtonTooltip(3).should('have.attr', 'data-tooltip', 'Include inferred data in results: OFF');

            // When I open a new Tab.
            YasguiSteps.openANewTab();

            // Then I expect that inferred element to be disabled in the new tab,
            YasqeSteps.getActionButton(3).should('have.class', 'icon-inferred-off');
            // and the tooltip of element describes that "infer" element is disabled.
            YasqeSteps.getActionButtonTooltip(3).should('have.attr', 'data-tooltip', 'Include inferred data in results: OFF');
        });
    });

    describe('sameAs configuration', () => {
        it('should be enabled when infer is true and sameAs is true in user settings', () => {
            stubInferAndSameAsDefaults(true, true);

            // When I visit a page with "ontotext-yasgui-web-component" in it.
            SparqlEditorSteps.visitSparqlEditorPage();
            YasguiSteps.getYasgui().should('be.visible');

            // Then I expect that "sameAs" element to be enabled by default
            YasqeSteps.getActionButton(4).should('have.class', 'icon-same-as-on');
            // and the tooltip of element describes that "sameAs" element is enabled.
            YasqeSteps.getActionButtonTooltip(4).should('have.attr', 'data-tooltip', 'Expand results over owl:sameAs: ON');

            // When I open a new Tab.
            YasguiSteps.openANewTab();

            // Then I expect that "sameAs" element to be enabled in the new tab.
            YasqeSteps.getActionButton(4).should('have.class', 'icon-same-as-on');
            // and the tooltip of element describes that "sameAs" element is enabled.
            YasqeSteps.getActionButtonTooltip(4).should('have.attr', 'data-tooltip', 'Expand results over owl:sameAs: ON');
        });

        it('should not be enabled when infer is true and sameAs is false in user settings', () => {
            stubInferAndSameAsDefaults(true, false);

            // When I visit a page with "ontotext-yasgui-web-component" in it.
            SparqlEditorSteps.visitSparqlEditorPage();
            YasguiSteps.getYasgui().should('be.visible');

            // Then I expect that "sameAs" element to be disabled by default
            YasqeSteps.getActionButton(4).should('have.class', 'icon-same-as-off');
            // and the tooltip of element describes that "sameAs" element is disabled.
            YasqeSteps.getActionButtonTooltip(4).should('have.attr', 'data-tooltip', 'Expand results over owl:sameAs: OFF');

            // When I open a new Tab.
            YasguiSteps.openANewTab();

            // Then I expect that "sameAs" element to be disabled in the new tab.
            YasqeSteps.getActionButton(4).should('have.class', 'icon-same-as-off');
            // and the tooltip of element describes that "sameAs" element is disabled.
            YasqeSteps.getActionButtonTooltip(4).should('have.attr', 'data-tooltip', 'Expand results over owl:sameAs: OFF');
        });

        it('should not be enabled when infer is false and sameAs is true in user settings', () => {
            stubInferAndSameAsDefaults(false, true);

            // When I visit a page with "ontotext-yasgui-web-component" in it.
            SparqlEditorSteps.visitSparqlEditorPage();
            YasguiSteps.getYasgui().should('be.visible');

            // Then I expect that "sameAs" element to be disabled by default
            YasqeSteps.getActionButtonTooltip(4).should('have.attr', 'data-tooltip', 'Requires \'Include Inferred\'!');
            // and the tooltip of element describes that "infer" is required.
            YasqeSteps.getActionButton(4).should('have.class', 'icon-same-as-off');

            // When I open a new Tab.
            YasguiSteps.openANewTab();

            // Then I expect that "sameAs" element to be disabled in the new tab,
            YasqeSteps.getActionButton(4).should('have.class', 'icon-same-as-off');
            // and the tooltip of element describes that "infer" is required.
            YasqeSteps.getActionButtonTooltip(4).should('have.attr', 'data-tooltip', 'Requires \'Include Inferred\'!');
        });

        it('should not be enabled when infer is false and sameAs is false in user settings', () => {
            stubInferAndSameAsDefaults(false, false);

            // When I visit a page with "ontotext-yasgui-web-component" in it.
            SparqlEditorSteps.visitSparqlEditorPage();
            YasguiSteps.getYasgui().should('be.visible');

            // Then I expect that "sameAs" element to be disabled by default,
            YasqeSteps.getActionButton(4).should('have.class', 'icon-same-as-off');
            // and the tooltip of element describes that "infer" is required.
            YasqeSteps.getActionButtonTooltip(4).should('have.attr', 'data-tooltip', 'Requires \'Include Inferred\'!');

            // When I open a new Tab.
            YasguiSteps.openANewTab();

            // Then I expect that "sameAs" element to be disabled in the new tab,
            YasqeSteps.getActionButton(4).should('have.class', 'icon-same-as-off');
            // and the tooltip of element describes that "infer" is required.
            YasqeSteps.getActionButtonTooltip(4).should('have.attr', 'data-tooltip', 'Requires \'Include Inferred\'!');
        });
    });

    function stubInferAndSameAsDefaults(infer = true, sameAs = true) {
        SecurityStubs.stubInferAndSameAsDefaults();
        SecurityStubs.stubUserSecurity(infer, sameAs);
    }
});
