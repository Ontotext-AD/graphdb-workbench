import {BaseSteps} from "../base-steps";

export class LicenseAlertSteps extends BaseSteps {

  static visit() {
    super.visit('license-alert');
  }

  static getLicenseAlert() {
    return cy.get('.onto-license-alert');
  }
}
