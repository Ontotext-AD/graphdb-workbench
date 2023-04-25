import {QueryStubs} from "../../../stubs/yasgui/query-stubs";
import {SparqlEditorSteps} from "../../../steps/sparql-editor-steps";
import {YasqeSteps} from "../../../steps/yasgui/yasqe-steps";
import {YasrSteps} from "../../../steps/yasgui/yasr-steps";
import {ApplicationSteps} from "../../../steps/application-steps";
import {TablePluginSteps} from "../../../steps/yasgui/table-plugin-steps";

describe('Yasr Table plugin', () => {
    let repositoryId;
    beforeEach(() => {
        repositoryId = 'sparql-editor-' + Date.now();
        QueryStubs.stubQueryCountResponse();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        QueryStubs.stubDefaultQueryResponse(repositoryId);
        // Given I visit a page with "ontotex-yasgu-web-component" in it.
        SparqlEditorSteps.visitSparqlEditorPage();
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    describe('Results formatting', () => {

        it('Should all resource be formatted with short uri when results are of type uri', () => {
            // When I execute a query which return results and results type is uri.
            QueryStubs.stubDefaultQueryResponse();
            YasqeSteps.executeQuery();

            // Then I expect results to be displayed with short uri.
            YasrSteps.getResultCell(1, 2).contains('rdf:type');
            YasrSteps.getResultCell(4, 3).contains('owl:TransitiveProperty');
        });

        it('Should copy url link be visible when the mouse is over a cell of result table', () => {
            // When I execute a query which return results and results type is uri.
            QueryStubs.stubDefaultQueryResponse();
            YasqeSteps.executeQuery();

            // And I hovered the mouse over a cell of result table.
            YasrSteps.hoverCell(28, 2);

            // Then I expect copy url link to be visible
            YasrSteps.getCopyResourceLink(28, 2).should('be.visible');
        });
    });

    describe('Copy resource link dialog', () => {

        it('Should open copy link dialog', () => {
            // When I execute a query which returns results of type is uri.
            QueryStubs.stubDefaultQueryResponse();
            YasqeSteps.executeQuery();
            // And copy resource dialog is open.
            openCopyResourceLinkDialog();

            // Then I expect copy link dialog to be opened.
            TablePluginSteps.getCopyResourceLinkDialog().should('be.visible');
        });

        it('Should close copy link dialog when click on close button', () => {
            // When I execute a query which returns results of type is uri.
            QueryStubs.stubDefaultQueryResponse();
            YasqeSteps.executeQuery();
            // And copy resource dialog is open.
            openCopyResourceLinkDialog();

            // When I click on close button
            TablePluginSteps.clickCopyLinkDialogCloseButton();

            // Then I expect copy link dialog to be closed.
            TablePluginSteps.getCopyResourceLinkDialog().should('not.exist');
        });

        it('Should close copy link dialog when click on cancel button', () => {
            // When I execute a query which returns results of type is uri.
            QueryStubs.stubDefaultQueryResponse();
            YasqeSteps.executeQuery();
            // And copy resource link dialog is open
            openCopyResourceLinkDialog();

            // And click on cancel button
            TablePluginSteps.clickCopyLinkDialogCancelButton();

            // Then I expect copy link dialog to be closed.
            TablePluginSteps.getCopyResourceLinkDialog().should('not.exist');
        });

        it('Should close copy link dialog when click on copy link button', () => {
            // When I execute a query which returns results of type is uri.
            QueryStubs.stubDefaultQueryResponse();
            YasqeSteps.executeQuery();
            // And copy resource link dialog is open
            openCopyResourceLinkDialog();

            // And click on copy button
            TablePluginSteps.clickCopyLinkDialogCopyButton();

            // Then I expect copy link dialog to be closed.
            TablePluginSteps.getCopyResourceLinkDialog().should('not.exist');
        });

        it('Should close copy link dialog when click outside dialog', () => {
            // When I execute a query which returns results of type is uri.
            QueryStubs.stubDefaultQueryResponse();
            YasqeSteps.executeQuery();
            // And copy resource link dialog is open
            openCopyResourceLinkDialog();

            // And click on copy button
            TablePluginSteps.clickOutsideCopyLinkDialog();

            // Then I expect copy link dialog to be closed.
            TablePluginSteps.getCopyResourceLinkDialog().should('not.exist');
        });

        it('Should input of copy link dialog be filled when dialog is open', () => {
            // When I execute a query which returns results of type is uri.
            QueryStubs.stubDefaultQueryResponse();
            YasqeSteps.executeQuery();
            // And copy resource link dialog is open
            openCopyResourceLinkDialog();

            // Then I expect the input of dialog to have value.
            TablePluginSteps.getCopyResourceLinkInput().should('have.value', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
        });

        it('Should show success message when user click on copy resource link button.', () => {
            // When I execute a query
            YasqeSteps.executeQuery();

            // Then I expect results to be displayed with short uri.
            YasrSteps.getResultCell(1, 2).contains('rdf:type');
            YasrSteps.getResultCell(4, 3).contains('owl:TransitiveProperty');

            // When I hovered the mouse over a cell of result table.
            YasrSteps.hoverCell(28, 2);

            // Then I expect copy url link to be visible
            YasrSteps.getCopyResourceLink(28, 2).should('be.visible');

            // When I click on a copy link.
            YasrSteps.clickOnCopyResourceLink(28, 2);

            // Then copy resource link dialog have to be opened.
            TablePluginSteps.getCopyResourceLinkDialog().should('be.visible');
            // And input of dialog have to be filled with resource uri
            TablePluginSteps.getCopyResourceLinkInput().should('have.value', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');

            // When I click on button "Copy to clipboard"
            TablePluginSteps.clickCopyLinkDialogCopyButton();

            // And expect success message to be displayed.
            ApplicationSteps.getSuccessNotifications().contains('URL copied successfully to clipboard.');
            // And copy resource link dialog have to not be opened.
            TablePluginSteps.getCopyResourceLinkDialog().should('not.exist');
        });
    });

    function openCopyResourceLinkDialog(rowNumber = 28, cellNumber = 2) {
        YasrSteps.hoverCell(rowNumber, cellNumber);
        YasrSteps.getCopyResourceLink(rowNumber, cellNumber).should('be.visible');
        YasrSteps.clickOnCopyResourceLink(rowNumber, cellNumber);
    }
});
