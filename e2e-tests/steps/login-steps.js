export class LoginSteps {
    static visitLoginPage() {
        cy.visit('/login');
    }

    static loginWithUser(username, password) {
        cy.get('#wb-login-username').type(username);
        cy.get('#wb-login-password').type(password);
        cy.get('#wb-login-submitLogin').click();
    }

    static logout() {
        cy.get('#btnGroupDrop2').click();
        cy.get('.dropdown-item')
            .contains('Logout')
            .closest('a')
            // Force the click because Cypress sometimes determines that the item has 0x0 dimensions
            .click({force: true});
    }
}
