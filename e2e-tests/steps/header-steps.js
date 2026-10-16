export class HeaderSteps {
    static getHeader() {
        return cy.get('onto-header');
    }

    static getUserMenu() {
        return HeaderSteps.getHeader().find('onto-user-menu');
    }

    static openHomePage() {
        HeaderSteps.getHeader().find('.home-page').click();
    }

    static logout() {
        HeaderSteps.getUserMenu().click();
        cy.get('.onto-user-menu-dropdown')
            .contains('Logout')
            .first()
            // Force the click because Cypress sometimes determines that the item has 0x0 dimensions
            .click({force: true});
    }

    static login() {
        this.getHeader().find('.onto-user-login').click();
    }
}
