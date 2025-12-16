import {BaseSteps} from "./base-steps.js";

export class ModalDialogSteps extends BaseSteps {
    static getDialog(cssClass = '.modal-dialog') {
        return cy.get(cssClass);
    }

    /**
     * Get the modal alert element. Modal alerts is also a modal dialog, but it has a modal-alert class on the main div
     * which is parent of modal-dialog.
     * @returns {Cypress.Chainable<JQuery<HTMLElement>>}
     */
    static getModalAlert() {
        return cy.get('.modal-alert');
    }

    static getDialogHeader() {
        return ModalDialogSteps.getDialog().find('.modal-header');
    }

    static getCloseButton() {
        return ModalDialogSteps.getDialogHeader().find('.close');
    }

    static clickOnCloseButton() {
        ModalDialogSteps.getCloseButton().click();
    }

    static close() {
        this.clickOnCloseButton();
    }

    static getDialogBody() {
        return ModalDialogSteps.getDialog().find('.modal-body');
    }

    static verifyDialogBody(message) {
        ModalDialogSteps.getDialogBody().contains(message);
    }

    static getDialogFooter() {
        return ModalDialogSteps.getDialog().find('.modal-footer');
    }

    static getConfirmButton() {
        return ModalDialogSteps.getDialogFooter().find('.confirm-btn');
    }

    static clickOnConfirmButton() {
        ModalDialogSteps.getConfirmButton().click();
    }

    static getOKButton() {
        return ModalDialogSteps.getDialogFooter().find('.btn-primary');
    }

    static clickOKButton() {
        ModalDialogSteps.getOKButton().click();
    }

    static confirm() {
        ModalDialogSteps.getConfirmButton().click();
    }

    static getCancelButton() {
        return ModalDialogSteps.getDialogFooter().find('.cancel-btn');
    }

    static clickOnCancelButton() {
        ModalDialogSteps.getCancelButton().click();
    }

    static cancel() {
        ModalDialogSteps.getCancelButton().click();
    }

    /**
     * Get the dialog with the given body. This method is useful when there are multiple dialogs on the page.
     *
     * @param body - the full or partial text of the dialog body.
     *
     * @return {Cypress.Chainable<JQuery<HTMLElement>>}
     */
    static getDialogWithBody(body) {
        return ModalDialogSteps.getDialog().contains(body).parent().parent();
    }

    /**
     * Click on the confirmation button of the dialog with the given body. This method is useful when there are multiple dialogs on the page.
     *
     * @param body - the full or partial text of the dialog body.
     */
    static cancelDialogWithBody(body) {
        ModalDialogSteps.getDialogWithBody(body).find('.cancel-btn').click();
    }

    static verifyUrlChangedConfirmation(verifyConfirmationDialogOptions = new VerifyConfirmationDialogOptions()) {
        // and try to change the page
        verifyConfirmationDialogOptions.changePageFunction();

        // Then I expect to be asked to confirm the leaving tha page.
        ModalDialogSteps.verifyDialogBody(verifyConfirmationDialogOptions.confirmationMessage);

        // When I click on close dialog button.
        ModalDialogSteps.clickOnCloseButton();

        // Then I expect to stay on same page.
        verifyConfirmationDialogOptions.verifyCurrentUrl();


        // When I try to change the page again.
        verifyConfirmationDialogOptions.changePageFunction();

        // Then I expect to be asked to confirm the leaving tha page.
        ModalDialogSteps.verifyDialogBody(verifyConfirmationDialogOptions.confirmationMessage);

        // When I click on cancel dialog button.
        ModalDialogSteps.clickOnCancelButton();

        // Then I expect to stay on same page.
        verifyConfirmationDialogOptions.verifyCurrentUrl();

        // When I try to change the page again.
        verifyConfirmationDialogOptions.changePageFunction();

        // Then I expect to be asked to confirm the leaving tha page.
        ModalDialogSteps.verifyDialogBody(verifyConfirmationDialogOptions.confirmationMessage);

        // When I click on confirm dialog button.
        ModalDialogSteps.clickOnConfirmButton();

        // Then I expect to be redirected.
        verifyConfirmationDialogOptions.verifyRedirectedUrl();
    }
}

export class VerifyConfirmationDialogOptions {
    constructor() {
        this.changePageFunction = () => {};
        this.confirmationMessage = "";
        this.verifyCurrentUrl = () => {};
        this.verifyRedirectedUrl = () => {};
    }

    setChangePageFunction(changePageFunction) {
        this.changePageFunction = changePageFunction;
        return this;
    }

    setConfirmationMessage(confirmationMessage) {
        this.confirmationMessage = confirmationMessage;
        return this;
    }

    setVerifyCurrentUrl(verifyCurrentUrl) {
        this.verifyCurrentUrl = verifyCurrentUrl;
        return this;
    }

    setVerifyRedirectedUrl(verifyRedirectedUrl) {
        this.verifyRedirectedUrl = verifyRedirectedUrl;
        return this;
    }
}
