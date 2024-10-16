export class SettingsSteps {
    static visit() {
        cy.visit('/settings');
    }

    static getCookiePolicyLink() {
        return cy.get('.cookie-policy-link a');
    }

    static clickCookiePolicyLink() {
        return SettingsSteps.getCookiePolicyLink().click();
    }

    static getCookiePolicyModal() {
        return cy.get('.cookie-policy-modal');
    }
}
