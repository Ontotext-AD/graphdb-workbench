import {UserAndAccessSteps} from "../../../steps/setup/user-and-access-steps";
import {MainMenuSteps} from "../../../steps/main-menu-steps";

describe('Users and Access initial state', () => {
    beforeEach(() => {
        cy.intercept('GET', '**/rest/security/users').as('getUsers');
    });

    it('Should display the correct initial state when navigating via URL', () => {
        // Given, I visit the Users and Access page via URL
        UserAndAccessSteps.visit();
        // Then,
        validateInitialState();
    });

    it('Should display the correct initial state when navigating via the navigation menu', () => {
        // Given, I visit the Users and Access page via the navigation menu
        UserAndAccessSteps.visit();
        MainMenuSteps.clickOnUsersAndAccess();
        // Then,
        validateInitialState();
    });
})

function validateInitialState() {
    cy.wait('@getUsers').then(({ response }) => {
        const users = response.body;
        expect(users).to.have.length(1);
        expect(users[0].grantedAuthorities).to.have.length(1);
    });

    UserAndAccessSteps.getTableRow().should('have.length', 1);
    UserAndAccessSteps.findUserInTable('admin')
        .within(() => {
            cy.get('.username').should('contain', 'admin');
        });
    UserAndAccessSteps.getToggleSecurityCheckbox().should('not.be.checked');
}
