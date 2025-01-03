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
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should be able to toggle expand results parameter', () => {
        QueryStubs.stubInferAndSameAsDefaults(true, true);
        SparqlEditorSteps.visitSparqlEditorPage();
        YasguiSteps.getYasgui().should('be.visible');
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

    it('should be enabled when infer is true and sameAs is true in user settings', () => {
        QueryStubs.stubInferAndSameAsDefaults(true, true);

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

    it('should not be enabled when infer is true and sameAs is false in user settings', {retries: {runMode: 2}},() => {
        QueryStubs.stubInferAndSameAsDefaults(true, false);

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
        QueryStubs.stubInferAndSameAsDefaults(false, true);

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
        QueryStubs.stubInferAndSameAsDefaults(false, false);

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
