import {SparqlEditorSteps} from "../../../steps/sparql-editor-steps";
import {YasguiSteps} from "../../../steps/yasgui-steps";
import {ApplicationSteps} from "../../../steps/application-steps";

describe('Save query', () => {

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
        // TODO: verify that it's save through the saved queries menu when it's ready
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
