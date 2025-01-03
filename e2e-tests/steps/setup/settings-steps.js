export class SettingsSteps {
    static visit() {
        cy.visit('/settings');
    }

    static getCookiePolicyButton() {
        return cy.get('.show-cookie-policy-btn');
    }

    static clickCookiePolicyLink() {
        return SettingsSteps.getCookiePolicyButton().click();
    }

    static getCookiePolicyModal() {
        return cy.get('.cookie-policy-modal');
    }
}
