export class ModalDialogSteps {
    static getDialog(cssClass = '.modal-dialog') {
        return cy.get(cssClass);
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

    static getCancelButton() {
        return ModalDialogSteps.getDialogFooter().find('.cancel-btn');
    }

    static clickOnCancelButton() {
        ModalDialogSteps.getCancelButton().click();
    }

    static cancel() {
        ModalDialogSteps.getCancelButton().click();
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
