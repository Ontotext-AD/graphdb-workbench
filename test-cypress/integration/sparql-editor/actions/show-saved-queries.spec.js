import {SparqlEditorSteps} from "../../../steps/sparql-editor-steps";
import {YasguiSteps} from "../../../steps/yasgui/yasgui-steps";

describe('Show saved queries', () => {

    let repositoryId;

    beforeEach(() => {
        repositoryId = 'sparql-editor-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        cy.intercept(`/repositories/${repositoryId}`, {fixture: '/graphql-editor/default-query-response.json'}).as('getGuides');

        SparqlEditorSteps.visitSparqlEditorPage();
        YasguiSteps.getYasgui().should('be.visible');
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should open a popup with the saved queries list', () => {
        // When I click on show saved queries button
        YasguiSteps.showSavedQueries();
        // Then I expect that a popup with a saved queries list to be opened
        YasguiSteps.getSavedQueriesPopup().should('be.visible');
        YasguiSteps.getSavedQueries().should('have.length.gt', 0);
    });

    it('Should be able to select a query from the list', () => {
        // Given I have opened the saved queries popup
        YasguiSteps.showSavedQueries();
        YasguiSteps.getSavedQueriesPopup().should('be.visible');
        // When I select a query from the list
        YasguiSteps.selectSavedQueryByIndex(0);
        // Then I expect that the popup should be closed
        YasguiSteps.getSavedQueriesPopup().should('not.exist');
        // And the query will be populated in a new tab in the yasgui
        YasguiSteps.getTabs().should('have.length', 2);
        YasguiSteps.getCurrentTab().should('contain', 'Add statements');
        YasguiSteps.getTabQuery(1).should('equal', 'PREFIX dc: <http://purl.org/dc/elements/1.1/>\nINSERT DATA\n      {\n      GRAPH <http://example> {\n          <http://example/book1> dc:title "A new book" ;\n                                 dc:creator "A.N.Other" .\n          }\n      }');
    });

    it('Should be able to close the popup by clicking outside', () => {
        // Given I have opened the saved queries popup
        YasguiSteps.showSavedQueries();
        YasguiSteps.getSavedQueriesPopup().should('be.visible');
        // When I click outside of the popup
        cy.get('body').click();
        // Then the popup should be closed
        YasguiSteps.getSavedQueriesPopup().should('not.exist');
    });
});
