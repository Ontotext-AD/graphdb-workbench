import {BaseSteps} from "../base-steps";

export class FooterSteps extends BaseSteps {
  static visit() {
    super.visit('footer');
  }

  static getFooter() {
    return cy.get('.footer-component');
  }
}
