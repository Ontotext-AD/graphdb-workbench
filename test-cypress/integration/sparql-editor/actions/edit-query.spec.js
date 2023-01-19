import {SparqlEditorSteps} from "../../../steps/sparql-editor-steps";
import {YasguiSteps} from "../../../steps/yasgui/yasgui-steps";
import {ApplicationSteps} from "../../../steps/application-steps";
import {QueryStubs} from "../../../stubs/yasgui/query-stubs";

describe('Edit saved queries', () => {

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

    it('Should prevent saving query with duplicated name', () => {
        // Given I have created a query
        YasguiSteps.getCreateSavedQueryButton().should('be.visible');
        YasguiSteps.createSavedQuery();
        YasguiSteps.clearQueryNameField();
        let savedQueryName = generateQueryName();
        YasguiSteps.writeQueryName(savedQueryName);
        YasguiSteps.clearQueryField();
        YasguiSteps.writeQuery('select *');
        YasguiSteps.toggleIsPublic();
        YasguiSteps.saveQuery();
        YasguiSteps.getSaveQueryDialog().should('not.exist');
        ApplicationSteps.getSuccessNotifications().should('be.visible');
        // When I open the saved queries popup
        YasguiSteps.showSavedQueries();
        // Then I expect to see the last saved query in the list
        YasguiSteps.getSavedQueries().should('contain', savedQueryName);
        // When I edit the saved query
        YasguiSteps.editQueryByName(savedQueryName);
        // Then I expect that save query dialog should be opened
        YasguiSteps.getQueryNameField().should('have.value', savedQueryName);
        YasguiSteps.getQueryField().should('have.value', 'select *');
        YasguiSteps.getIsPublicField().should('be.checked');
        // When I change the query
        YasguiSteps.clearQueryField();
        YasguiSteps.writeQuery('select $s $p $o');
        // And try to save the query
        YasguiSteps.saveQuery();
        // Then the query should be updated
        YasguiSteps.getSaveQueryDialog().should('not.exist');
        YasguiSteps.showSavedQueries();
        YasguiSteps.editQueryByName(savedQueryName);
        YasguiSteps.getQueryField().should('have.value', 'select $s $p $o');
        // When I change the query name
        // TODO: This currently won't work. The legacy implementation in the WB does the following:
        // * First POST to create a new query with the new name
        // * Then DELETE the query with the old name
        // This is quite hackish and would require maintaining some state in the WB which is awkward.
        // Better approach would be to think of a way to delegate this to the backend api for the edit.
        // YasguiSteps.clearQueryNameField();
        // savedQueryName = generateQueryName();
        // YasguiSteps.writeQueryName(savedQueryName);
        // YasguiSteps.saveQuery();
        // // Then a new query should be created
        // YasguiSteps.getSaveQueryDialog().should('not.exist');
        // YasguiSteps.showSavedQueries();
        // YasguiSteps.editQueryByName(savedQueryName);
        // YasguiSteps.getQueryNameField().should('have.value', savedQueryName);
        // YasguiSteps.getQueryField().should('have.value', 'select $s $p $o');
    });
});

function generateQueryName() {
    return 'Saved query - ' + Date.now();
}
