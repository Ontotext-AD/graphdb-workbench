import {BaseSteps} from "../base-steps.js";

export class GuideDialogSteps extends BaseSteps {

    static getModalDialog() {
        return cy.get('.shepherd-content:visible');
    }

    static getHeader() {
        return GuideDialogSteps.getModalDialog().find('.shepherd-header');
    }

    static getCancelButton() {
        return this.getHeader().find('.shepherd-cancel-icon');
    }

    static clickOnCancelButton() {
        return this.getCancelButton().click();
    }

    static getConfirmCancelDialog() {
        return this.getByTestId('confirm-cancel-dialog');
    }

    static getConfirmCancelDialogCloseButton() {
        return this.getByTestId('close-dialog-btn');
    }

    static clickOnConfirmCancelDialogCloseButton() {
        return this.getConfirmCancelDialogCloseButton().click();
    }

    static getConfirmCancelDialogCancelButton() {
        return this.getByTestId('cancel-btn');
    }

    static clickConfirmCancelDialogCancelButton() {
        return this.getConfirmCancelDialogCancelButton().click();
    }

    static getConfirmCancelDialogDontShowAgainButton() {
        return this.getByTestId('dont-show-again-btn');
    }

    static clickConfirmCancelDialogDontShowAgainButton() {
        return this.getConfirmCancelDialogDontShowAgainButton().click();
    }

    static getConfirmCancelDialogExitButton() {
        return this.getByTestId('exit-btn');
    }

    static clickConfirmCancelDialogExitButton() {
        return this.getConfirmCancelDialogExitButton().click();
    }

    static getContent() {
        return GuideDialogSteps.getModalDialog().find('.shepherd-text');
    }

    static getFooter() {
        return GuideDialogSteps.getModalDialog().find('.shepherd-footer');
    }

    static getNextButton() {
        return GuideDialogSteps.getFooter().find('.shepherd-button').contains('Next');
    }

    static getPreviousButton() {
        return GuideDialogSteps.getFooter().find('.shepherd-button').contains('Previous');
    }

    static getCloseButton() {
        return GuideDialogSteps.getFooter().find('.shepherd-button').contains('Close');
    }

    static getSkipButton() {
        return GuideDialogSteps.getFooter().find('.shepherd-button').contains('Skip');
    }

    static clickOnNextButton(forceVisible = false) {
        return GuideDialogSteps.getNextButton().scrollIntoView().click({force: forceVisible});
    }

    static clickOnPreviousButton(forceVisible = false) {
        GuideDialogSteps.getPreviousButton().scrollIntoView().click({force: forceVisible});
    }

    static clickOnCloseButton() {
        GuideDialogSteps.getCloseButton().scrollIntoView().click();
    }

    static clickOnSkipButton() {
        GuideDialogSteps.getSkipButton().scrollIntoView().click();
    }

    static getContentLink() {
        return GuideDialogSteps.getContent().find('a');
    }


    static assertDialogWithTitleIsVisible(text) {
        GuideDialogSteps.getHeader().contains(text);
    }

    static assertDialogWithContentIsVisible(text) {
        GuideDialogSteps.getContent().should('contain.text', text);
    }

    static assertDialogIsClosed() {
        GuideDialogSteps.getModalDialog().should('not.exist');
    }

    static copyQueryToEditor() {
        GuideDialogSteps.getModalDialog().find('.guide-copy-to-editor-query-button').click();
    }
}
