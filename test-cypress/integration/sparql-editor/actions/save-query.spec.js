import {SparqlEditorSteps} from "../../../steps/sparql-editor-steps";
import {YasguiSteps} from "../../../steps/yasgui/yasgui-steps";
import {ApplicationSteps} from "../../../steps/application-steps";
import {QueryStubs} from "../../../stubs/yasgui/query-stubs";
import {SaveQueryDialog} from "../../../steps/yasgui/save-query-dialog";
import {SavedQuery} from "../../../steps/yasgui/saved-query";
import {SavedQueriesDialog} from "../../../steps/yasgui/saved-queries-dialog";

describe('Save query', () => {

    let repositoryId;

    beforeEach(() => {
        repositoryId = 'sparql-editor-' + Date.now();
        cy.intercept('GET', '/rest/monitor/query/count', {body: 0});
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        QueryStubs.stubDefaultQueryResponse(repositoryId);

        SparqlEditorSteps.visitSparqlEditorPage();
        YasguiSteps.getYasgui().should('be.visible');
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should be able to edit query and save it', () => {
        // Given I have opened the sparql editor page
        // And I have created a query
        const savedQueryName = SavedQuery.generateQueryName();
        SavedQuery.create(savedQueryName);
        // When I open the saved queries popup
        YasguiSteps.showSavedQueries();
        // Then I expect to see the saved query in the list
        SavedQueriesDialog.getSavedQueries().should('contain', savedQueryName);
        // When I select the query
        SavedQueriesDialog.selectSavedQueryByName(savedQueryName);
        // Then I expect to see the query opened in a new editor tab
        YasguiSteps.getTabs().should('have.length', 2);
        YasguiSteps.getCurrentTab().should('contain', savedQueryName);
        YasguiSteps.getTabQuery(1).should('equal', 'select *');
    });

    it('Should prevent saving query with duplicated name', () => {
        // Given I have opened the sparql editor page
        YasguiSteps.getCreateSavedQueryButton().should('be.visible');
        // And I have created a query
        const savedQueryName = SavedQuery.generateQueryName();
        SavedQuery.create(savedQueryName);
        // When I try to save the query with the same name
        YasguiSteps.createSavedQuery();
        SaveQueryDialog.clearQueryNameField();
        SaveQueryDialog.writeQueryName(savedQueryName);
        SaveQueryDialog.saveQuery();
        // Then I expect that dialog will remain open and an error will be visible
        // TODO: find out why this check fails on Jenkins sometimes with
        // AssertionError: Timed out retrying after 30000ms: Expected to find element: `.toast-error`, but never found it. Queried from element: <div#toast-container.toast-bottom-right>
        // ApplicationSteps.getErrorNotifications().should('be.visible');
        SaveQueryDialog.getSaveQueryDialog().should('be.visible');
        SaveQueryDialog.getErrorsPane().should('contain', 'Error! Cannot create saved query');
        // When I change the query name
        SaveQueryDialog.clearQueryNameField();
        SaveQueryDialog.writeQueryName(SavedQuery.generateQueryName());
        SaveQueryDialog.saveQuery();
        // Then I should be able to save the query
        SaveQueryDialog.getSaveQueryDialog().should('not.exist');
        ApplicationSteps.getSuccessNotifications().should('be.visible');
    });
});
