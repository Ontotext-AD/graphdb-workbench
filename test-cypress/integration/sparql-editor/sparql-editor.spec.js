import {SparqlEditorSteps} from "../../steps/sparql-editor-steps";
import {YasguiSteps} from "../../steps/yasgui-steps";

describe('Default view', () => {

    beforeEach(() => {
        cy.intercept('/repositories/test-repo', {fixture: '/graphql-editor/default-query-response.json'}).as('getGuides');
    });

    it('Should load component with default configuration', () => {
        SparqlEditorSteps.visitSparqlEditorPage();

        YasguiSteps.getYasgui().should('be.visible');
    });
});
