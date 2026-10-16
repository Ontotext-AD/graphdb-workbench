import {EnvironmentStubs} from "../stubs/environment-stubs";
const VIEW_URL = '/login';
export class LoginSteps {
    static visitLoginPage() {
        cy.visit(VIEW_URL);
    }

    static visitInProdMode() {
        cy.visit(VIEW_URL, {
            onBeforeLoad: () => {
                EnvironmentStubs.stubWbProdMode();
            }
        });
    }

    static visitLoginPageWithReturnUrl(returnURL) {
        const returnURLEncoded = encodeURIComponent(returnURL);
        cy.visit(`/login?r=${returnURLEncoded}`);
    }

    static verifyUrl() {
        cy.url().should('include', `${Cypress.config('baseUrl')}${VIEW_URL}`);
    }

    static getLoginPage() {
        return cy.get('app-login');
    }

    static navigateToLoginPage() {
        cy.get('onto-user-login').click();
    }

    static loginWithUser(username, password) {
        cy.get('.login-form').should('be.visible');
        cy.getByTestId('username-input').type(username);
        cy.getByTestId('password-input').type(password);
        cy.getByTestId('submit-btn').click();
    }

    // TODO: Use the HeaderSteps.logout()
    static logout() {
        cy.get('onto-user-menu').click();
        cy.get('.onto-user-menu-dropdown')
            .contains('Logout')
            .first()
            // Force the click because Cypress sometimes determines that the item has 0x0 dimensions
            .click({force: true});
    }
}
