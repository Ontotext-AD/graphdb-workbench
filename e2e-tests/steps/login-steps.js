export class LoginSteps {
    static visitLoginPage() {
        cy.visit('/login');
    }

    static loginWithUser(username, password) {
        cy.get('#wb-login').should('be.visible');
        cy.get('input[formControlName="username"]').type(username);
        cy.get('input[formControlName="password"]').type(password);
        cy.get('button[type="submit"]').click();
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
