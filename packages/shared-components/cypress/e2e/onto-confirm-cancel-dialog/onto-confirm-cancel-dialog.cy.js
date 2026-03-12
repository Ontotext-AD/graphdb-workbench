import {OntoConfirmCancelDialogSteps} from '../../steps/onto-confirm-cancel-dialog/onto-confirm-cancel-dialog-steps';

describe('OntoConfirmCancelDialog', () => {
  it('should open and close the dialog ', () => {
    // Given I visit the onto-confirm-cancel-dialog page
    OntoConfirmCancelDialogSteps.visit();

    // When I open the confirm cancel dialog
    OntoConfirmCancelDialogSteps.openConfirmCancelDialog();

    // Then the dialog should be visible
    OntoConfirmCancelDialogSteps.getConfirmCancelDialog().should('be.visible');
    // And the "don't show again" button should not be shown
    OntoConfirmCancelDialogSteps.getDontShowAgainButton().should('not.exist');

    // When I click the close (X) button
    OntoConfirmCancelDialogSteps.closeDialog();

    // Then the dialog should not be visible
    OntoConfirmCancelDialogSteps.getConfirmCancelDialog().should('not.exist');

    // When I open the dialog with dontShowAgain option
    OntoConfirmCancelDialogSteps.openConfirmCancelDialogWithDontShowAgain();

    // Then the dialog should open and I should see a dontShowAgain button
    OntoConfirmCancelDialogSteps.getConfirmCancelDialog().should('be.visible');
    OntoConfirmCancelDialogSteps.getDontShowAgainButton().should('be.visible');

    // When I click the dontShowAgain button
    OntoConfirmCancelDialogSteps.dontShowAgain();

    // Then the dialog should close
    OntoConfirmCancelDialogSteps.getConfirmCancelDialog().should('not.exist');

    // I should also be able to close it with the exit and cancel buttons
    OntoConfirmCancelDialogSteps.openConfirmCancelDialogWithDontShowAgain();
    OntoConfirmCancelDialogSteps.getConfirmCancelDialog().should('be.visible');
    OntoConfirmCancelDialogSteps.clickExitButton();
    OntoConfirmCancelDialogSteps.getConfirmCancelDialog().should('not.exist');

    OntoConfirmCancelDialogSteps.openConfirmCancelDialogWithDontShowAgain();
    OntoConfirmCancelDialogSteps.getConfirmCancelDialog().should('be.visible');
    OntoConfirmCancelDialogSteps.cancel();
    OntoConfirmCancelDialogSteps.getConfirmCancelDialog().should('not.exist');
  });
});
