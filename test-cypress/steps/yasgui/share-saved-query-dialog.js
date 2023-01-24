export class ShareSavedQueryDialog {
    static getDialog() {
        return cy.get('.share-saved-query-dialog');
    }

    static getShareLink() {
        return this.getDialog().find('#shareLink');
    }

    static copyLink() {
        this.getDialog().find('.copy-button').click();
    }
}
