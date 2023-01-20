import {SparqlEditorSteps} from "../../../steps/sparql-editor-steps";
import {YasguiSteps} from "../../../steps/yasgui/yasgui-steps";
import {ApplicationSteps} from "../../../steps/application-steps";
import {QueryStubs} from "../../../stubs/yasgui/query-stubs";

describe('Delete saved queries', () => {

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

    it('Should delete saved query', () => {
        // Given I have created a query
        YasguiSteps.getCreateSavedQueryButton().should('be.visible');
        YasguiSteps.createSavedQuery();
        YasguiSteps.clearQueryNameField();
        const savedQueryName = generateQueryName();
        YasguiSteps.writeQueryName(savedQueryName);
        YasguiSteps.clearQueryField();
        YasguiSteps.writeQuery('select *');
        YasguiSteps.saveQuery();
        YasguiSteps.getSaveQueryDialog().should('not.exist');
        YasguiSteps.showSavedQueries();
        YasguiSteps.getSavedQueries().should('contain.text', savedQueryName);
        // When I trigger delete button
        YasguiSteps.deleteQueryByName(savedQueryName);
        // Then I expect a confirmation dialog
        YasguiSteps.getDeleteQueryConfirmation().should('be.visible');
        // When I reject delete operation
        YasguiSteps.rejectDeleteOperation();
        YasguiSteps.getDeleteQueryConfirmation().should('not.exist');
        // Then selected query should not be deleted
        YasguiSteps.showSavedQueries();
        YasguiSteps.getSavedQueries().should('contain.text', savedQueryName);
        // When I trigger delete button again
        YasguiSteps.deleteQueryByName(savedQueryName);
        YasguiSteps.getDeleteQueryConfirmation().should('be.visible');
        // And I confirm delete operation
        YasguiSteps.confirmDeleteOperation();
        // Then selected query should be deleted
        YasguiSteps.getDeleteQueryConfirmation().should('not.exist');
        ApplicationSteps.getSuccessNotifications().should('be.visible');
        YasguiSteps.showSavedQueries();
        YasguiSteps.getSavedQueries().should('not.contain.text', savedQueryName);
    });
});

function generateQueryName() {
    return 'Saved query - ' + Date.now();
}
