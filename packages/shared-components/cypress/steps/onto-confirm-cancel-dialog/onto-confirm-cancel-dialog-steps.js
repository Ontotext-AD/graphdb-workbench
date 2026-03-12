import {BaseSteps} from '../base-steps';

export class OntoConfirmCancelDialogSteps extends BaseSteps {
  static visit() {
    super.visit('onto-confirm-cancel-dialog');
  }

  static openConfirmCancelDialog() {
    cy.get('#open-confirm-cancel-dialog').click();
  }

  static openConfirmCancelDialogWithDontShowAgain() {
    cy.get('#open-confirm-cancel-dialog-with-dont-show-again').click();
  }

  static getConfirmCancelDialog() {
    return this.getByTestId('confirm-cancel-dialog');
  }

  static closeDialog() {
    return this.getByTestId('close-dialog-btn').click();
  }

  static cancel() {
    return this.getByTestId('cancel-btn').click();
  }

  static getDontShowAgainButton() {
    return this.getByTestId('dont-show-again-btn');
  }

  static dontShowAgain() {
    return this.getDontShowAgainButton().click();
  }

  static clickExitButton() {
    return this.getByTestId('exit-btn').click();
  }
}
