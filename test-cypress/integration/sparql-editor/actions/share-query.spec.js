import {SparqlEditorSteps} from "../../../steps/sparql-editor-steps";
import {YasguiSteps} from "../../../steps/yasgui/yasgui-steps";
import {ApplicationSteps} from "../../../steps/application-steps";
import {QueryStubs} from "../../../stubs/yasgui/query-stubs";
import {DEFAULT_QUERY, SavedQuery} from "../../../steps/yasgui/saved-query";
import {SavedQueriesDialog} from "../../../steps/yasgui/saved-queries-dialog";
import {ShareSavedQueryDialog} from "../../../steps/yasgui/share-saved-query-dialog";

describe('Share query', () => {

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

    it('Should be able to get a share link for query in the current tab', () => {
        // Given I have created a query
        const savedQueryName = SavedQuery.generateQueryName();
        SavedQuery.create(savedQueryName);
        // And I saved and opened the query
        YasguiSteps.showSavedQueries();
        SavedQueriesDialog.selectSavedQueryByName(savedQueryName);
        // When I click share query
        YasguiSteps.shareQuery(1);
        // Then I expect that share query dialog will be opened
        ShareSavedQueryDialog.getDialog().should('be.visible');
        ShareSavedQueryDialog.getShareLink().then((shareLink) => {
            expect(shareLink).to.have.string(`/sparql-editor?name=${encodeURIComponent(savedQueryName)}&query=select%20*&infer=true&sameAs=true`);
        });
        // When I click copy button
        ShareSavedQueryDialog.copyLink();
        // Then I expect link to be copied
        ShareSavedQueryDialog.getDialog().should('not.exist');
        ApplicationSteps.getSuccessNotifications().should('be.visible');
    });

    it('Should be able to open a share link in a new editor tab', () => {
        // Given I have created a query and get the share link
        YasguiSteps.getTabs().should('have.length', 1);
        const savedQueryName = SavedQuery.generateQueryName();
        SavedQuery.create(savedQueryName);
        YasguiSteps.showSavedQueries();
        SavedQueriesDialog.selectSavedQueryByName(savedQueryName);
        YasguiSteps.shareQuery(1);
        ShareSavedQueryDialog.getShareLink().then((shareLink) => {
            ShareSavedQueryDialog.copyLink();
            YasguiSteps.openTab(0);
            cy.visit(shareLink);
            // Then I expect that the sparql view should be opened
            // And the saved query will be loaded in the editor
            YasguiSteps.getTabs().should('have.length', 2);
            YasguiSteps.getCurrentTab().should('contain', savedQueryName);
            YasguiSteps.getTabQuery(0).should('contain', DEFAULT_QUERY);
        });
    });
});
