import {SparqlEditorSteps} from "../../../steps/sparql-editor-steps";
import {YasguiSteps} from "../../../steps/yasgui/yasgui-steps";
import {ApplicationSteps} from "../../../steps/application-steps";
import {QueryStubs} from "../../../stubs/yasgui/query-stubs";
import {SavedQuery} from "../../../steps/yasgui/saved-query";
import {SavedQueriesDialog} from "../../../steps/yasgui/saved-queries-dialog";
import {ShareSavedQueryDialog} from "../../../steps/yasgui/share-saved-query-dialog";

describe('Share saved queries', () => {

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

    it('Should be able to get a share link for any saved query', () => {
        // Given I have created a query
        const savedQueryName = SavedQuery.generateQueryName();
        SavedQuery.create(savedQueryName);
        // When I select to share the new saved query
        YasguiSteps.showSavedQueries();
        SavedQueriesDialog.shareQueryByName(savedQueryName);
        // Then I expect that share query dialog will be opened
        ShareSavedQueryDialog.getDialog().should('be.visible');
        ShareSavedQueryDialog.getShareLink().then(($el) => {
            expect($el.val()).to.have.string(`/sparql-editor?savedQueryName=${encodeURIComponent(savedQueryName)}`);
        });
        // When I click copy button
        ShareSavedQueryDialog.copyLink();
        // Then I expect link to be copied
        ShareSavedQueryDialog.getDialog().should('not.exist');
        ApplicationSteps.getSuccessNotifications().should('be.visible');
    });

    it.skip('Should be able to open a saved query through a share link', () => {

    });
});
