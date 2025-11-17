import {BaseSteps} from '../base-steps';

export class NotificationSteps extends BaseSteps {
  static visit() {
    super.visit('notification');
  }

  static clickSuccessNotificationButton() {
    cy.get('#success-notification').click();
  }

  static clickInfoNotificationButton() {
    cy.get('#info-notification').click();
  }

  static clickWarningNotificationButton() {
    cy.get('#warning-notification').click();
  }

  static clickErrorNotificationButton() {
    cy.get('#error-notification').click();
  }
}
