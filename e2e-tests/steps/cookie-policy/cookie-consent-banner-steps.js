export class CookieConsentBannerSteps {
    static getCookieConsentBanner() {
        return cy.get('.cookie-consent-banner');
    }

    static getCookieConsentButton() {
        return this.getCookieConsentBanner().find('button');
    }

    static giveCookieConsent() {
        return this.getCookieConsentButton().click();
    }

    static getCookiePolicyLink() {
        return cy.get('.cookie-consent-content a');
    }

    static clickCookiePolicyLink() {
        return this.getCookiePolicyLink().click();
    }
}
