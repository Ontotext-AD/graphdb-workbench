export class CookieConsentBannerSteps {
    static getCookieConsentBanner() {
        return cy.get('.cookie-consent-banner');
    }

    static getCookieConsentButton() {
        return this.getCookieConsentBanner().find('#accept-cookie-policy');
    }

    static giveCookieConsent() {
        return this.getCookieConsentButton().click();
    }

    static getCookiePolicyLink() {
        return cy.get('#cookie-policy-link');
    }

    static clickCookiePolicyLink() {
        return this.getCookiePolicyLink().click();
    }
}
