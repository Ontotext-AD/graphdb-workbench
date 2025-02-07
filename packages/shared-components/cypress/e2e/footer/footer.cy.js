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
    const expectedFooterContent = `GraphDB 11.0-SNAPSHOT • RDF4J 4.3.15 • Connectors 16.2.13-RC2 • Workbench 2.8.0 • © 2002–${currentYear} Ontotext AD`;
    FooterSteps.getFooter()
      .invoke('text')
      .should('contain', expectedFooterContent);

    // And the 'All rights reserved' label should be present and visible and
    FooterSteps.getAllRightsReservedElement()
      .should('be.visible')

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

  it('Should show/hide cookie consent component', () => {
    // Given I visit the footer page
    FooterSteps.visit();

    // Then, I expect the cookie consent component not to be visible,
    // because tracking is not allowed. Also, there is no license information
    FooterSteps.getCookieConsentComponent().should('not.exist');

    // When, I set a free license, prod mode and a user, who hasn't accepted the cookie policy
    FooterSteps.setFreeLicense();
    FooterSteps.setProdMode();
    FooterSteps.setNotAcceptedUser();

    // Then, I expect the cookie consent component to be visible, because we meet
    // all 3 criteria for visibility
    FooterSteps.getCookieConsentComponent().should('be.visible');

    // When, I add the user consent
    FooterSteps.setAcceptedUser()

    // Then, I expect the cookie consent component to disappear
    FooterSteps.getCookieConsentComponent().should('not.exist');

    //When, I set dev mode and remove the user consent
    FooterSteps.setDevMode();
    FooterSteps.setNotAcceptedUser();

    // Then, I expect the cookie consent component not to be visible, because we are in dev mode
    FooterSteps.getCookieConsentComponent().should('not.exist');

    // When, I set a paid license, prod mode and a user, who hasn't accepted the cookie policy
    FooterSteps.setPaidLicense();
    FooterSteps.setProdMode();
    // Set accepted and then unaccepted, otherwise the context subscription will not trigger
    FooterSteps.setAcceptedUser()
    FooterSteps.setNotAcceptedUser();

    // Then, I expect the cookie consent component to not be visible, because tracking
    // paid license is not allowed
    FooterSteps.getCookieConsentComponent().should('not.exist');
  });

  it('Should hide cookie policy, when it is accepted', () => {
    // Given, I visit the footer page
    FooterSteps.visit();

    // When, I have set a free license, prod mode and a user, who hasn't accepted the cookie policy
    FooterSteps.setFreeLicense();
    FooterSteps.setProdMode();
    FooterSteps.setNotAcceptedUser();

    // Then, I expect the cookie consent component to be visible, because we meet
    // all 3 criteria for visibility
    FooterSteps.getCookieConsentComponent().should('be.visible');

    // When, I accept the cookie policy
    FooterSteps.acceptCookiePolicy();

    // Then, I expect the cookie consent component to disappear
    FooterSteps.getCookieConsentComponent().should('not.exist');
  });
});
