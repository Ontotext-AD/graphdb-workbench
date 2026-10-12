import {BaseSteps} from "../base-steps";

export class CookieConsentSteps extends BaseSteps {
  static visit() {
    super.visit('cookie-consent');
  }

  static getCookiePolicyDialog() {
    return cy.get('onto-cookie-policy-dialog');
  }

  static getCookiePolicyButton() {
    return cy.get('#cookie-policy-link');
  }

  static focusCookiePolicyButton() {
    return this.getCookiePolicyButton().focus();
  }

  static clickCookiePolicyLink() {
    return this.getCookiePolicyButton().click();
  }
}
