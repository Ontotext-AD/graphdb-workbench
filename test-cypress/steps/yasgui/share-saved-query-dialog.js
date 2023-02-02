export class ShareSavedQueryDialog {
    static getDialog() {
        return cy.get('.share-saved-query-dialog');
    }

    static getDialogTitle() {
        return this.getDialog().find('.dialog-title');
    }

    static getShareLinkField() {
        return this.getDialog().find('#shareLink');
    }

    static getShareLink() {
        return this.getShareLinkField().invoke('val');
    }

    static copyLink() {
        this.getDialog().find('.copy-button').click();
    }

    static closeDialog() {
        this.getDialog().find('.cancel-button').click();
    }
}
