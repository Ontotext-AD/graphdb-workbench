import {CookieConsentSteps} from "../../steps/cookie-consent/cookie-consent.steps";
import {FooterSteps} from "../../steps/footer/footer-steps";

describe('CookieConsent', () => {
  it('should render cookie consent component', () => {
    // Given I visit the cookie consent page
    CookieConsentSteps.visit();

    // Then I expect the cookie consent component to be visible and the dialog to not be shown
    FooterSteps.getCookieConsentComponent().should('be.visible');
    CookieConsentSteps.getCookiePolicyDialog().should('not.exist');

    // And, when I click on the cookie policy link
    CookieConsentSteps.clickCookiePolicyLink();

    // Then I expect the cookie policy dialog to be visible
    CookieConsentSteps.getCookiePolicyDialog().should('be.visible');
  });
});

