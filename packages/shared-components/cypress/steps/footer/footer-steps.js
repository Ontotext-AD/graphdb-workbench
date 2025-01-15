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
}
