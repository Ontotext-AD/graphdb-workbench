export class GuideDialogSteps {

    static getModalDialog() {
        return cy.get('.shepherd-content:visible');
    }

    static getHeader() {
        return GuideDialogSteps.getModalDialog().find('.shepherd-header');
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

    static clickOnNextButton(forceVisible = false) {
        GuideDialogSteps.getNextButton().scrollIntoView().click({force: forceVisible});
    }

    static clickOnPreviousButton(forceVisible = false) {
        GuideDialogSteps.getPreviousButton().scrollIntoView().click({force: forceVisible});
    }

    static clickOnCloseButton() {
        GuideDialogSteps.getCloseButton().scrollIntoView().click();
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
}
