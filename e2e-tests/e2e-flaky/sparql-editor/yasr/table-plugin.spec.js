import {QueryStubs} from "../../../stubs/yasgui/query-stubs";
import {SparqlEditorSteps} from "../../../steps/sparql-editor-steps";
import {YasqeSteps} from "../../../steps/yasgui/yasqe-steps";
import {YasrSteps} from "../../../steps/yasgui/yasr-steps";
import {ApplicationSteps} from "../../../steps/application-steps";
import {TablePluginSteps} from "../../../steps/yasgui/table-plugin-steps";

//TODO: Fix me. Broken due to migration (Error: beforeEach)
describe.skip('Yasr Table plugin', () => {
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

    describe('Copy resource link dialog', () => {
        it('Should copy url link be visible when the mouse is over a cell of result table', () => {
            // When I execute a query which return results and results type is uri.
            QueryStubs.stubDefaultQueryResponse();
            YasqeSteps.executeQuery();

            // And I hovered the mouse over a cell of result table.
            YasrSteps.hoverCell(28, 2);

            // Then I expect copy url link to be visible
            YasrSteps.getCopyResourceLink(28, 2).should('be.visible');
        });

        it('Should be able to copy a link', {
            retries: {
                runMode: 1,
                openMode: 0
            }
        }, () => {
            // When I execute a query which returns results of type is uri.
            QueryStubs.stubDefaultQueryResponse();
            YasqeSteps.executeQuery();

            // And copy resource dialog is open.
            openCopyResourceLinkDialog();

            // Then I expect copy link dialog to be opened.
            TablePluginSteps.getCopyResourceLinkDialog().should('be.visible');

            // And I expect the input of dialog to have value.
            TablePluginSteps.getCopyResourceLinkInput().should('have.value', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');

            // When I click on cancel button
            TablePluginSteps.clickCopyLinkDialogCancelButton();

            // Then I expect copy link dialog to be closed.
            TablePluginSteps.getCopyResourceLinkDialog().should('not.exist');

            // And copy resource dialog is open.
            openCopyResourceLinkDialog();

            // And click on copy button
            TablePluginSteps.clickCopyLinkDialogCopyButton();

            // Then I expect copy link dialog to be closed.
            TablePluginSteps.getCopyResourceLinkDialog().should('not.exist');

            // And expect success message to be displayed.
            ApplicationSteps.getSuccessNotifications().contains('URL copied successfully to clipboard.');

        });
    });
});

function openCopyResourceLinkDialog(rowNumber = 28, cellNumber = 2) {
    YasrSteps.getCopyResourceLink(rowNumber, cellNumber).should('be.visible');
    YasrSteps.copyResourceLink(rowNumber, cellNumber);
}
