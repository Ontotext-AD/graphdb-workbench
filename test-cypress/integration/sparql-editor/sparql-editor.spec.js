import {SparqlEditorSteps} from "../../steps/sparql-editor-steps";
import {YasguiSteps} from "../../steps/yasgui/yasgui-steps";
import {QueryStubs} from "../../stubs/yasgui/query-stubs";

describe('Default view', () => {

    beforeEach(() => {
        const repositoryId = 'sparql-editor-' + Date.now();
        QueryStubs.stubQueryCountResponse();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        cy.intercept('/repositories/test-repo', {fixture: '/graphql-editor/default-query-response.json'}).as('getGuides');
    });

    it('Should load component with default configuration', () => {
        SparqlEditorSteps.visitSparqlEditorPage();

        YasguiSteps.getYasgui().should('be.visible');
    });
});