import {BaseSteps} from "../base-steps";

export class HeaderSteps extends BaseSteps {
  static visit() {
    super.visit('header');
  }

  static getHeader() {
    return cy.get('.header-component');
  }
}
