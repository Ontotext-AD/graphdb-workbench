export class LoginSteps {
    static visitLoginPage() {
        cy.visit('/login');
    }

    static loginWithUser(username, password) {
        cy.get('.login-form').should('be.visible');
        cy.get('#wb-login-username').type(username);
        cy.get('#wb-login-password').type(password);
        cy.get('#wb-login-submitLogin').click();
    }

    static logout() {
        cy.get('onto-user-menu').click();
        cy.get('.onto-user-menu-dropdown')
            .contains('Logout')
            .first()
            // Force the click because Cypress sometimes determines that the item has 0x0 dimensions
            .click({force: true});
    }
}
