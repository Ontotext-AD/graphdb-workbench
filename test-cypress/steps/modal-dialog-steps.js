import {MainMenuSteps} from "./main-menu-steps";
import {JdbcCreateSteps} from "./setup/jdbc-create-steps";
import ImportSteps from "./import-steps";

export class ModalDialogSteps {
    static getDialog() {
        return cy.get('.modal-dialog');
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

    static verifyUrlChangedConfirmation(confirmMessage) {
        // and try to change the page
        MainMenuSteps.clickOnMenuImport();

        // Then I expect to be asked to confirm the leaving tha page.
        ModalDialogSteps.verifyDialogBody(confirmMessage);

        // When I click on close dialog button.
        ModalDialogSteps.clickOnCloseButton();

        // Then I expect to stay on same page.
        JdbcCreateSteps.verifyUrl();

        // When I try to change the page again.
        MainMenuSteps.clickOnMenuImport();

        // Then I expect to be asked to confirm the leaving tha page.
        ModalDialogSteps.verifyDialogBody(confirmMessage);

        // When I click on cancel dialog button.
        ModalDialogSteps.clickOnCancelButton();

        // Then I expect to stay on same page.
        JdbcCreateSteps.verifyUrl();

        // When I try to change the page again.
        MainMenuSteps.clickOnMenuImport();

        // Then I expect to be asked to confirm the leaving tha page.
        ModalDialogSteps.verifyDialogBody(confirmMessage);

        // When I click on confirm dialog button.
        ModalDialogSteps.clickOnConfirmButton();

        // Then I expect to stay on same page.
        ImportSteps.verifyUserImportUrl();
    }
}
