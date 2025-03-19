import {BaseSteps} from "../base-steps";

export class ToastrSteps extends BaseSteps {
  static visit() {
    super.visit('toastr');
  }

  static getToastr() {
    return cy.get('onto-toastr');
  }

  static getVisibleToasts() {
    return this.getToastr().find('.onto-toast');
  }

  static clickSuccessToastButton() {
    cy.get('#success-toast-btn').click();
  }

  static clickInfoToastButton() {
    cy.get('#info-toast-btn').click();
  }

  static clickWarningToastButton() {
    cy.get('#warning-toast-btn').click();
  }

  static clickErrorToastButton() {
    cy.get('#error-toast-btn').click();
  }

  static clickLinkToastButton() {
    cy.get('#link-toast-btn').click();
  }
}
