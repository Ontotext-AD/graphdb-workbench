import {SparqlEditorSteps} from "../../../steps/sparql-editor-steps";
import {YasguiSteps} from "../../../steps/yasgui/yasgui-steps";
import {QueryStubs} from "../../../stubs/yasgui/query-stubs";
import {SavedQuery} from "../../../steps/yasgui/saved-query";
import {SavedQueriesDialog} from "../../../steps/yasgui/saved-queries-dialog";
import {SaveQueryDialog} from "../../../steps/yasgui/save-query-dialog";

/**
 * TODO: Fix me. Broken due to migration (Error: beforeEach)
 */
describe.skip('Edit saved queries', () => {

    let repositoryId;
    let savedQueryName;

    beforeEach(() => {
        repositoryId = 'sparql-editor-' + Date.now();
        savedQueryName = SavedQuery.generateQueryName();
        QueryStubs.stubQueryCountResponse();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        QueryStubs.stubDefaultQueryResponse(repositoryId);

        SparqlEditorSteps.visitSparqlEditorPage();
        YasguiSteps.getYasgui().should('be.visible');
    });

    afterEach(() => {
        cy.deleteSavedQuery(savedQueryName);
        cy.deleteRepository(repositoryId);
    });

    it('Should prevent saving query with duplicated name', () => {
        // Given I have created a query
        SavedQuery.create(savedQueryName);
        // When I open the saved queries popup
        YasguiSteps.showSavedQueries();
        // Then I expect to see the last saved query in the list
        SavedQueriesDialog.getSavedQueries().should('contain', savedQueryName);
        // When I edit the saved query
        SavedQueriesDialog.editQueryByName(savedQueryName);
        // Then I expect that save query dialog should be opened
        SaveQueryDialog.getQueryNameField().should('have.value', savedQueryName);
        SaveQueryDialog.getQueryField().should('have.value', 'select *');
        SaveQueryDialog.getIsPublicField().should('be.checked');
        // When I change the query
        SaveQueryDialog.clearQueryField();
        SaveQueryDialog.writeQuery('select $s $p $o');
        // And try to save the query
        SaveQueryDialog.saveQuery();
        // Then the query should be updated
        SaveQueryDialog.getSaveQueryDialog().should('not.exist');
        YasguiSteps.showSavedQueries();
        SavedQueriesDialog.editQueryByName(savedQueryName);
        SaveQueryDialog.getQueryField().should('have.value', 'select $s $p $o');
        // Then I close the dialog
        SaveQueryDialog.closeSaveQueryDialog();
    });

    // TODO skipped until .env can be updated with BE version, which includes the API changes
    it.skip('should allow renaming saved query', () => {
        // Given I have created a query
        SavedQuery.create(savedQueryName);
        // When I open the saved queries popup
        YasguiSteps.showSavedQueries();
        // And I edit the saved query
        SavedQueriesDialog.editQueryByName(savedQueryName);
        // Then the save query dialog should be opened
        SaveQueryDialog.getQueryNameField().should('have.value', savedQueryName);
        SaveQueryDialog.getQueryField().should('have.value', 'select *');
        SaveQueryDialog.getIsPublicField().should('be.checked');
        // When I change the query name
        SaveQueryDialog.clearQueryNameField();
        savedQueryName = SavedQuery.generateQueryName();
        SaveQueryDialog.writeQueryName(savedQueryName);
        // And try to save the query
        SaveQueryDialog.saveQuery();
        // Then the query should be updated
        SaveQueryDialog.getSaveQueryDialog().should('not.exist');
        YasguiSteps.showSavedQueries();
        SavedQueriesDialog.editQueryByName(savedQueryName);
        SaveQueryDialog.getQueryNameField().should('have.value', savedQueryName);
        SaveQueryDialog.getQueryField().should('have.value', 'select *');
        // Then I close the dialog
        SaveQueryDialog.closeSaveQueryDialog();
    });
});
