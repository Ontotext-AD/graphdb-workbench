import {SharedModalDialogSteps} from '../shared-modal-dialog-steps';

export class CookiePolicyModalSteps extends SharedModalDialogSteps {
    static getDialogComponent(cssClass = '.cookie-policy-modal') {
        return super.getDialogComponent(cssClass);
    }

    static getStatisticCookiesToggle() {
        return this.getBody().find('.statistic-cookies-toggle .toggle-switch');
    }

    static getStatisticCookiesCheckbox() {
        return this.getStatisticCookiesToggle().find('input');
    }

    static toggleStatisticCookies() {
        this.getStatisticCookiesToggle().click();
        // Wait here is intentional because there is a debounce before the checkbox state is updated
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(500);
    }

    static getThirdPartyCookiesToggle() {
        return this.getBody().find('.third-party-cookies-toggle .toggle-switch');
    }

    static getThirdPartyCookiesCheckbox() {
        return this.getThirdPartyCookiesToggle().find('input');
    }

    static toggleThirdPartyCookies() {
        this.getThirdPartyCookiesToggle().click();
        // Wait here is intentional because there is a debounce before the checkbox state is updated
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(500);
    }

    static closeDialog() {
        this.getFooter().find('.close-btn').click();
    }

    /**
     * Validates the cookie policy dialog by checking the visibility of the dialog and the state of the checkboxes for
     * analytic and third party cookies.
     * @param {boolean} expectedStatisticChecked
     * @param {boolean} expectedThirdPartyChecked
     */
    static validateCookiePolicyDialog(expectedStatisticChecked, expectedThirdPartyChecked) {
        // I should see the cookie policy
        CookiePolicyModalSteps.getDialogComponent().should('be.visible');
        CookiePolicyModalSteps.getBody().should('be.visible');
        // And I expect to see that analytic and third party cookies are allowed
        CookiePolicyModalSteps.getStatisticCookiesCheckbox().should(expectedStatisticChecked ? 'be.checked' : 'not.be.checked');
        CookiePolicyModalSteps.getThirdPartyCookiesCheckbox().should(expectedThirdPartyChecked ? 'be.checked' : 'not.be.checked');
    }
}
