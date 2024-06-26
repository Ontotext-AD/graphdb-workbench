import {ModalDialogSteps} from "../modal-dialog-steps";

export class ImportSettingsDialogSteps extends ModalDialogSteps {
    static getImportButton() {
        return this.getDialog().find('.import-settings-import-button');
    }

    static import() {
        this.getImportButton().click();
    }

    static getCancelImportButton() {
        return this.getDialog().find('.cancel-import-button');
    }

    static cancelImport() {
        this.getCancelImportButton().click();
    }

    static getSettingsForm() {
        return this.getDialog().find('.settings-form');
    }

    static expandAdvancedSettings() {
        this.getSettingsForm().within(() => {
            cy.get('.toggle-advanced-settings').click();
            cy.get('.advanced-settings').should('be.visible');
        });
    }

    static fillBaseURI(baseURI) {
        this.getSettingsForm().find('input[name="baseURI"]').type(baseURI).should('have.value', baseURI);
    }

    static selectNamedGraph() {
        this.getSettingsForm().find('.named-graph-btn').check();
    }

    static fillNamedGraph(namedGraph) {
        this.getSettingsForm().find('.named-graph-input').type(namedGraph).should('have.value', namedGraph);
    }

    static enablePreserveBNodes() {
        this.getSettingsForm().find('input[name="preserveBNodeIDs"]').check();
    }

    static fillContextLink(contextLink) {
        this.getSettingsForm().find('input[name="contextLink"]').type(contextLink).should('have.value', contextLink);
    }

    static setContextLinkToBeVisible() {
        this.getSettingsForm().within(() => {
            cy.get('.contextLinkRow').invoke('attr', 'style', 'display: block !important');
        });
    }

    static getReplaceExistingDataCheckbox() {
        return this.getSettingsForm().find('input.existing-data-replacement');
    }
}
