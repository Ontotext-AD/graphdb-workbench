import {BaseSteps} from "../base-steps";

export class OperationsNotificationSteps extends BaseSteps {
  static visit() {
    super.visit('operations-notification');
  }

  static getOperationsNotification() {
    return cy.get('onto-operations-notification');
  }

  static getHeaderGroups() {
    return this.getOperationsNotification().find('.operation-status-header');
  }

  static getOperationsDropdownElements() {
    return this.getOperationsNotification().find('.operation-status-content');
  }

  static getDropdownButton() {
    return this.getOperationsNotification().find('.operations-statuses-dropdown-toggle');
  }
}
