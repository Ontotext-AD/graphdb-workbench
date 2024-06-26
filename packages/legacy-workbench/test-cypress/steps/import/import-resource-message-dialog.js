export class ImportResourceMessageDialog {

    static getDialog() {
        return cy.get('.import-resource-message-dialog');
    }

    static getDialogHeader() {
        return ImportResourceMessageDialog.getDialog().find('.modal-header');
    }

    static getCornerCloseButton() {
        return ImportResourceMessageDialog.getDialogHeader().find('.close');
    }

    static clickOnCornerCloseButton() {
        ImportResourceMessageDialog.getCornerCloseButton().click();
    }

    static getDialogBody() {
        return ImportResourceMessageDialog.getDialog().find('.modal-body');
    }

    static getDialogFooter() {
        return ImportResourceMessageDialog.getDialog().find('.modal-footer');
    }

    static getCloseButton() {
        return ImportResourceMessageDialog.getDialogFooter().find('.close-btn');
    }

    static clickOnCloseButton() {
        ImportResourceMessageDialog.getCloseButton().click();
    }

    static getMessage() {
        return this.getDialogBody().find('.message');
    }

    static getCopyToClipboard() {
        return ImportResourceMessageDialog.getDialogFooter().find('.copy-to-clipboard-btn')
    }

    static copyToClipboard() {
        ImportResourceMessageDialog.getCopyToClipboard().click();
    }
}
