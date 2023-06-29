import {SparqlEditorSteps} from "../../../steps/sparql-editor-steps";
import {YasguiSteps} from "../../../steps/yasgui/yasgui-steps";
import {ApplicationSteps} from "../../../steps/application-steps";
import {QueryStubs} from "../../../stubs/yasgui/query-stubs";
import {DEFAULT_QUERY} from "../../../steps/yasgui/saved-query";
import {ShareSavedQueryDialog} from "../../../steps/yasgui/share-saved-query-dialog";
import {YasqeSteps} from "../../../steps/yasgui/yasqe-steps";

describe('Share query', () => {

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

    it('Should be able to get shareable link for current query', () => {
        // When I click on share query action
        YasqeSteps.shareQuery();
        // Then I expect a dialog with the shareable link to appear
        ShareSavedQueryDialog.getDialog().should('be.visible');
        ShareSavedQueryDialog.getDialogTitle().should('contain', 'Copy URL to clipboard');
        ShareSavedQueryDialog.getShareLink().then((shareLink) => {
            expect(shareLink).to.have.string(`/sparql?name=Unnamed&query=select%20*%20where%20%7B%20%20%0A%20%3Fs%20%3Fp%20%3Fo%20.%20%0A%20%7D%20limit%20100&infer=true&sameAs=true`);
        });
        // When I cancel operation
        ShareSavedQueryDialog.closeDialog();
        // Then I expect that the dialog should be closed
        ShareSavedQueryDialog.getDialog().should('not.exist');
        // And I click the copy button
        YasqeSteps.shareQuery();
        ShareSavedQueryDialog.getDialog().should('be.visible');
        ShareSavedQueryDialog.copyLink();
        // Then I expect that the share link is copied in the clipboard
        ShareSavedQueryDialog.getDialog().should('not.exist');
        ApplicationSteps.getSuccessNotifications().should('be.visible');
    });

    it('Should be able to open a share link in a new editor tab',
        {
            retries: {
                runMode: 1,
                openMode: 0
            }
        }, () => {
        // Given I have opened the sparql editor
        YasguiSteps.getTabs().should('have.length', 1);
        // When I get the shareable link for current query
        YasqeSteps.shareQuery();
        ShareSavedQueryDialog.getDialog().should('be.visible');
        // And I open the link
        ShareSavedQueryDialog.getShareLink().then((shareLink) => {
            cy.visit(shareLink);
            // Then I expect that the sparql view should be opened
            // And the saved query will be loaded in the editor
            YasguiSteps.getTabs().should('have.length', 1);
            YasguiSteps.getCurrentTab().should('contain', 'Unnamed');
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
