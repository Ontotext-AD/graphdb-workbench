/**
 * Basic steps for interacting with the onto-dialog component. This class is designed to be extended by more specific
 * dialog steps classes.
 */
export class SharedModalDialogSteps {
    /**
     * Returns the onto-dialog element.
     * This is the generic method to get the dialog element.
     */
    static getDialog() {
        return cy.get('onto-dialog');
    }

    /**
     * Returns a child component of the dialog based on the provided CSS class. The onto-dialog component is designed to
     * be flexible and can contain be composed of various child components included in different slots: header, body,
     * and footer.
     * The purpose of this method is to allow selection of specific dialog in case there are multiple dialogs in the page.
     * @param cssClass - The CSS class of the child component to retrieve. Defaults to '.dialog', which will return the
     * dialog itself.
     */
    static getDialogComponent(cssClass = '.dialog') {
        return cy.get(cssClass);
    }

    static getHeader() {
        return this.getDialog().find('.dialog-header');
    }

    static getBody() {
        return this.getDialog().find('.dialog-body');
    }

    static getFooter() {
        return this.getDialog().find('.dialog-footer');
    }

    static getCloseButton() {
        return this.getHeader().find('.close');
    }

    static close() {
        this.getCloseButton().click();
    }
}
