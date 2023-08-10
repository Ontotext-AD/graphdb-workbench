import {SparqlEditorSteps} from "../../steps/sparql-editor-steps";
import {TabContextMenu, YasguiSteps} from "../../steps/yasgui/yasgui-steps";
import {YasqeSteps} from "../../steps/yasgui/yasqe-steps";
import {YasrSteps} from "../../steps/yasgui/yasr-steps";
import {ConfirmationDialogSteps} from "../../steps/yasgui/confirmation-dialog-steps";
import {QueryStubs} from "../../stubs/yasgui/query-stubs";

describe('Yasgui tabs', () => {

    let repositoryId;
    beforeEach(() => {
        repositoryId = 'sparql-editor-' + Date.now();
        QueryStubs.stubQueryCountResponse();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        QueryStubs.stubDefaultQueryResponse(repositoryId);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should ask for confirmation on tab close', () => {
        // Given I have opened yasgui with a single opened tab
        SparqlEditorSteps.visitSparqlEditorPage();
        // And I have created a second tab
        openNewTab(2);
        // When I close the second tab
        YasguiSteps.closeTab(1);
        // Then I expect a confirmation dialog to be opened
        ConfirmationDialogSteps.getConfirmation().should('be.visible');
        ConfirmationDialogSteps.getConfirmation().should('contain.text', 'Are you sure you want to close this query tab?');
        // When I cancel the operation
        ConfirmationDialogSteps.reject();
        ConfirmationDialogSteps.getConfirmation().should('not.exist');
        // Then I expect that to remain opened
        YasguiSteps.getTabs().should('have.length', 2);
        // When I try closing it again
        YasguiSteps.closeTab(1);
        ConfirmationDialogSteps.getConfirmation().should('be.visible');
        // And I confirm
        ConfirmationDialogSteps.confirm();
        // Then I expect that the tab will be closed
        YasguiSteps.getTabs().should('have.length', 1);
        YasguiSteps.getCurrentTabTitle().should('have.text', 'Unnamed');
    });

    it('Should ask for confirmation on tab close through tab context menu', {
        retries: {
            runMode: 1,
            openMode: 0
        }
    }, () => {
        // Given I have opened yasgui with a single opened tab
        SparqlEditorSteps.visitSparqlEditorPage();
        // And I have created a second tab
        openNewTab(2);
        // When I close the second tab
        YasguiSteps.openTabContextMenu(1).should('be.visible');
        TabContextMenu.closeTab();
        // Then I expect a confirmation dialog to be opened
        ConfirmationDialogSteps.getConfirmation().should('be.visible');
        // And I confirm
        ConfirmationDialogSteps.confirm();
        // Then I expect that the tab will be closed
        YasguiSteps.getTabs().should('have.length', 1);
        YasguiSteps.getCurrentTabTitle().should('have.text', 'Unnamed');
    });

    it('Should ask for confirmation on close other tabs action', {
        retries: {
            runMode: 1,
            openMode: 0
        }
    }, () => {
        // Given I have opened yasgui with a single opened tab
        SparqlEditorSteps.visitSparqlEditorPage();
        // And I have created more tabs
        openNewTab(2);
        // When I try closing all other tabs but the last one
        YasguiSteps.openTabContextMenu(1).should('be.visible');
        TabContextMenu.closeOtherTabs();
        // Then I expect a confirmation dialog to be opened
        ConfirmationDialogSteps.getConfirmation().should('be.visible');
        ConfirmationDialogSteps.getConfirmation().should('contain.text', 'Are you sure you want to close all other query tabs?');
        // When I cancel the operation
        ConfirmationDialogSteps.reject();
        ConfirmationDialogSteps.getConfirmation().should('not.exist');
        // Then I expect that to remain opened
        YasguiSteps.getTabs().should('have.length', 2);
        YasguiSteps.openTabContextMenu(1).should('be.visible');
        TabContextMenu.closeOtherTabs();
        ConfirmationDialogSteps.getConfirmation().should('be.visible');
        // And I confirm
        ConfirmationDialogSteps.confirm();
        // Then I expect that the tab will be closed
        YasguiSteps.getTabs().should('have.length', 1);
        YasguiSteps.getCurrentTabTitle().should('have.text', 'Unnamed 1');
    });
});

function openNewTab(expectedTabsCount) {
    YasguiSteps.openANewTab();
    YasguiSteps.getTabs().should('have.length', expectedTabsCount);
    // Execute the query for a bit of delay before closing the tab
    YasqeSteps.executeQuery();
}
