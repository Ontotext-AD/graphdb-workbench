import {SparqlEditorSteps} from "../../../steps/sparql-editor-steps";
import {YasguiSteps} from "../../../steps/yasgui/yasgui-steps";
import {ApplicationSteps} from "../../../steps/application-steps";
import {QueryStubs} from "../../../stubs/yasgui/query-stubs";
import {SavedQuery} from "../../../steps/yasgui/saved-query";
import {SavedQueriesDialog} from "../../../steps/yasgui/saved-queries-dialog";
import {SaveQueryDialog} from "../../../steps/yasgui/save-query-dialog";

/**
 * TODO: Fix me. Broken due to migration (Error: beforeEach)
 */
describe.skip('Delete saved queries', () => {

    let repositoryId;

    beforeEach(() => {
        repositoryId = 'sparql-editor-' + Date.now();
        QueryStubs.stubQueryCountResponse();
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
        const savedQueryName = SavedQuery.generateQueryName();
        SavedQuery.create(savedQueryName);
        SaveQueryDialog.getSaveQueryDialog().should('not.exist');
        YasguiSteps.showSavedQueries();
        SavedQueriesDialog.getSavedQueries().should('contain.text', savedQueryName);
        // When I trigger delete button
        SavedQueriesDialog.deleteQueryByName(savedQueryName);
        // Then I expect a confirmation dialog
        YasguiSteps.getDeleteQueryConfirmation().should('be.visible');
        // When I reject delete operation
        YasguiSteps.rejectDeleteOperation();
        YasguiSteps.getDeleteQueryConfirmation().should('not.exist');
        // Then selected query should not be deleted
        YasguiSteps.showSavedQueries();
        SavedQueriesDialog.getSavedQueries().should('contain.text', savedQueryName);
        // When I trigger delete button again
        SavedQueriesDialog.deleteQueryByName(savedQueryName);
        YasguiSteps.getDeleteQueryConfirmation().should('be.visible');
        // And I confirm delete operation
        YasguiSteps.confirmDeleteOperation();
        // Then selected query should be deleted
        YasguiSteps.getDeleteQueryConfirmation().should('not.exist');
        ApplicationSteps.getSuccessNotifications().should('be.visible');
        YasguiSteps.showSavedQueries();
        SavedQueriesDialog.getSavedQueries().should('not.contain.text', savedQueryName);
    });
});
