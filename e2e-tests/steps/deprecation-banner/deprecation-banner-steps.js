export class DeprecationSteps {
    static getDeprecationBanner() {
        return cy.get('onto-deprecation-banner');
    }

    static getCloseButton() {
        return DeprecationSteps.getDeprecationBanner().find('.close-button');
    }

    static closeBanner() {
        DeprecationSteps.getCloseButton().click();
    }
}
