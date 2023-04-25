import {SparqlEditorSteps} from "../../../steps/sparql-editor-steps";
import {YasguiSteps} from "../../../steps/yasgui/yasgui-steps";
import {ApplicationSteps} from "../../../steps/application-steps";
import {QueryStubs} from "../../../stubs/yasgui/query-stubs";
import {DEFAULT_QUERY, SavedQuery} from "../../../steps/yasgui/saved-query";
import {SavedQueriesDialog} from "../../../steps/yasgui/saved-queries-dialog";
import {ShareSavedQueryDialog} from "../../../steps/yasgui/share-saved-query-dialog";

describe('Share saved queries', () => {

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

    it('Should be able to get a share link for any saved query', () => {
        // Given I have created a query
        const savedQueryName = SavedQuery.generateQueryName();
        SavedQuery.create(savedQueryName);
        // When I select to share the new saved query
        YasguiSteps.showSavedQueries();
        SavedQueriesDialog.shareQueryByName(savedQueryName);
        // Then I expect that share query dialog will be opened
        ShareSavedQueryDialog.getDialog().should('be.visible');
        ShareSavedQueryDialog.getShareLink().then((shareLink) => {
            expect(shareLink).to.have.string(`/sparql-editor?savedQueryName=${encodeURIComponent(savedQueryName)}`);
        });
        // When I click copy button
        ShareSavedQueryDialog.copyLink();
        // Then I expect link to be copied
        ShareSavedQueryDialog.getDialog().should('not.exist');
        ApplicationSteps.getSuccessNotifications().should('be.visible');
    });

    it('Should be able to open a share link in a new editor tab', () => {
        // Given I have created a query
        YasguiSteps.getTabs().should('have.length', 1);
        const savedQueryName = SavedQuery.generateQueryName();
        SavedQuery.create(savedQueryName);
        // When I get the shareable link for the query
        YasguiSteps.showSavedQueries();
        SavedQueriesDialog.shareQueryByName(savedQueryName);
        ShareSavedQueryDialog.getDialog().should('be.visible');
        // And I open the link
        ShareSavedQueryDialog.getShareLink().then((shareLink) => {
            cy.visit(shareLink);
            // Then I expect that the sparql view should be opened
            // And the saved query will be loaded in the editor
            YasguiSteps.getTabs().should('have.length', 2);
            YasguiSteps.getCurrentTab().should('contain', savedQueryName);
            YasguiSteps.getTabQuery(0).should('contain', DEFAULT_QUERY);
            // TODO: And the infer should be active
            // TODO: And the expand results should be active
            // When I open the other tab
            // TODO: the next step appears to be flaky with the element is detached error
            // YasguiSteps.openTab(0);
            // YasguiSteps.getCurrentTab().should('contain', 'Unnamed');
            // // And I open the share link again
            // cy.visit(shareLink);
            // // Then I expect that the previously opened tab to be selected instead of opening a new one
            // YasguiSteps.getTabs().should('have.length', 2);
            // YasguiSteps.getCurrentTab().should('contain', savedQueryName);
            // YasguiSteps.getTabQuery(0).should('contain', DEFAULT_QUERY);
        });
    });
});
