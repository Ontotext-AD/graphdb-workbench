import {FooterSteps} from "../../steps/footer/footer-steps";

describe('Footer', () => {
  it('Should render footer', () => {
    // Given I visit the footer page
    FooterSteps.visit();

    // Then I expect the footer to be visible
    FooterSteps.getFooter().should('be.visible');

    // When, I load product information
    FooterSteps.loadProductInfo();

    // Then, I expect the product information to be loaded and visible in the footer
    const currentYear = new Date().getFullYear();
    const expectedFooterContent = `GraphDB 11.0-SNAPSHOT • RDF4J 4.3.15 • Connectors 16.2.13-RC2 • Workbench 2.8.0 • © 2002–${currentYear} Ontotext AD. All rights reserved.`;
    FooterSteps.getFooter()
      .invoke('text')
      .should('contain', expectedFooterContent);

    // And the GraphDB link should be present and valid
    FooterSteps.getGraphDBLink()
      .should('have.text', 'GraphDB')
      .should('have.attr', 'href', 'http://graphdb.ontotext.com');

    // And the RDF4J link to be present and valid
    FooterSteps.getSesameLink()
      .should('contain.text', 'RDF4J')
      .should('have.attr', 'href', 'http://rdf4j.org');

    // And the Ontotext AD link to be present and valid
    FooterSteps.getOntotextAdLink()
      .should('have.text', 'Ontotext AD')
      .should('have.attr', 'href', 'http://ontotext.com');
  });
});
