export class HeaderSteps {
    static getHeader() {
        return cy.get('onto-header');
    }

    static openHomePage() {
        HeaderSteps.getHeader().find('.home-page').click();
    }
}
