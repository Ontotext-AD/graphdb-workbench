export class TablePluginSteps {
    static getCopyResourceLinkDialog() {
        return cy.get('.copy-resource-link-dialog');
    }

    static getCopyResourceLinkInput() {
        return this.getCopyResourceLinkDialog().find('input');
    }

    static clickCopyLinkDialogCopyButton() {
        this.getCopyResourceLinkDialog().find('.copy-button').click();
    }

    static clickCopyLinkDialogCloseButton() {
        this.getCopyResourceLinkDialog().find('.close-button').click();
    }

    static clickCopyLinkDialogCancelButton() {
        this.getCopyResourceLinkDialog().find('.cancel-button').click();
    }

    static clickOutsideCopyLinkDialog() {
        cy.get('body').click(0, 0);
    }

    static getQueryResultInfo() {
        return cy.get('.tabPanel.active .yasr_response_chip');
    }
}
