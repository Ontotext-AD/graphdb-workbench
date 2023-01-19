import {SparqlEditorSteps} from "../../../steps/sparql-editor-steps";
import {YasguiSteps} from "../../../steps/yasgui/yasgui-steps";
import {ApplicationSteps} from "../../../steps/application-steps";
import {QueryStubs} from "../../../stubs/yasgui/query-stubs";

describe('Save query', () => {

    let repositoryId;

    beforeEach(() => {
        repositoryId = 'sparql-editor-' + Date.now();
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
        YasguiSteps.getCreateSavedQueryButton().should('be.visible');
        YasguiSteps.createSavedQuery();
        // When I write a query name
        YasguiSteps.clearQueryNameField();
        const savedQueryName = generateQueryName();
        YasguiSteps.writeQueryName(savedQueryName);
        YasguiSteps.clearQueryField();
        YasguiSteps.writeQuery('select *');
        YasguiSteps.toggleIsPublic();
        // And I click on save button
        YasguiSteps.saveQuery();
        // Then the query should be saved
        YasguiSteps.getSaveQueryDialog().should('not.exist');
        ApplicationSteps.getSuccessNotifications().should('be.visible');
        // When I open the saved queries popup
        YasguiSteps.showSavedQueries();
        // Then I expect to see the saved query in the list
        YasguiSteps.getSavedQueries().should('contain', savedQueryName);
        // When I select the query
        YasguiSteps.selectSavedQueryByName(savedQueryName);
        // Then I expect to see the query opened in a new editor tab
        YasguiSteps.getTabs().should('have.length', 2);
        YasguiSteps.getCurrentTab().should('contain', savedQueryName);
        YasguiSteps.getTabQuery(1).should('equal', 'select *');
    });

    it('Should prevent saving query with duplicated name', () => {
        // Given I have opened the sparql editor page
        YasguiSteps.getCreateSavedQueryButton().should('be.visible');
        YasguiSteps.createSavedQuery();
        // When I write a query name
        YasguiSteps.clearQueryNameField();
        const savedQueryName = generateQueryName();
        YasguiSteps.writeQueryName(savedQueryName);
        YasguiSteps.clearQueryField();
        YasguiSteps.writeQuery('select *');
        YasguiSteps.toggleIsPublic();
        // And I click on save button
        YasguiSteps.saveQuery();
        // Then the query should be saved
        YasguiSteps.getSaveQueryDialog().should('not.exist');
        ApplicationSteps.getSuccessNotifications().should('be.visible');
        // When I try to save the query with the same name
        YasguiSteps.createSavedQuery();
        YasguiSteps.clearQueryNameField();
        YasguiSteps.writeQueryName(savedQueryName);
        YasguiSteps.saveQuery();
        // Then I expect that dialog will remain open and an error will be visible
        // TODO: find out why this check fails on Jenkins sometimes with
        // AssertionError: Timed out retrying after 30000ms: Expected to find element: `.toast-error`, but never found it. Queried from element: <div#toast-container.toast-bottom-right>
        // ApplicationSteps.getErrorNotifications().should('be.visible');
        YasguiSteps.getSaveQueryDialog().should('be.visible');
        YasguiSteps.getErrorsPane().should('contain', 'Error! Cannot create saved query');
        // When I change the query name
        YasguiSteps.clearQueryNameField();
        YasguiSteps.writeQueryName(generateQueryName());
        YasguiSteps.saveQuery();
        // Then I should be able to save the query
        YasguiSteps.getSaveQueryDialog().should('not.exist');
        ApplicationSteps.getSuccessNotifications().should('be.visible');
    });
});

function generateQueryName() {
    return 'Saved query - ' + Date.now();
}
