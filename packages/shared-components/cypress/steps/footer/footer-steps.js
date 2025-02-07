import {BaseSteps} from "../base-steps";

export class FooterSteps extends BaseSteps {
  static visit() {
    super.visit('footer');
  }

  static getFooter() {
    return cy.get('.footer-component');
  }

  static getGraphDBLink() {
    return FooterSteps.getFooter().contains('a', 'GraphDB').first();
  }

  static getSesameLink() {
    return FooterSteps.getFooter().contains('a', 'RDF4J').first();
  }

  static getOntotextAdLink() {
    return FooterSteps.getFooter().contains('a', 'Ontotext AD').first();
  }

  static loadProductInfo() {
    return cy.get('#load-product-info').click();
  }

  static getAllRightsReservedElement() {
    return FooterSteps.getFooter().get('translate-label');
  }

  static getCookieConsentComponent() {
    return cy.get('onto-cookie-consent');
  }

  static setDevMode() {
    return cy.get('#set-dev-mode').click();
  }

  static setProdMode() {
    return cy.get('#set-prod-mode').click();
  }

  static setAcceptedUser() {
    return cy.get('#set-accepted-user').click();
  }

  static setNotAcceptedUser() {
    return cy.get('#set-not-accepted-user').click();
  }

  static setFreeLicense() {
    return cy.get('#set-free-license').click();
  }

  static setPaidLicense() {
    return cy.get('#set-paid-license').click();
  }

  static acceptCookiePolicy() {
    return this.getCookieConsentComponent().get('#accept-cookie-policy').click();
  }
}
