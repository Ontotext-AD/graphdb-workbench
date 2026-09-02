// import {MainMenuSteps} from '../steps/main-menu-steps.js';
import {UserAndAccessSteps} from '../steps/setup/user-and-access-steps.js';
import {LoginSteps} from '../steps/login-steps.js';
// import {SecurityStubs} from "../stubs/security-stubs.js";


describe('LDAP - CRUD, User Management and Permissions, Corner Cases', () => {
    let testRepo;

    beforeEach(() => {
        cy.loginAsLDAPAdmin();
        // cy.loginAsLDAPAdmin();

        // cy.setDefaultUserData();
        // cy.switchOffSecurity(true);
        // SecurityStubs.stubGetLDAPAdminUser();

        // LoginSteps.loginWithUser(LDAPUsername, LDAPPassword);
        // MainMenuSteps.clickOnUsersAndAccess();
        // Navigate to Users & Access
        UserAndAccessSteps.visit();

    });



        it('Should validate initial state of page elements when LDAP is configured', () => {


            UserAndAccessSteps.visit();
            UserAndAccessSteps.getToggleSecurityCheckbox().should('not.be.true');
            UserAndAccessSteps.getToggleSecuritySwitch()

        });

        it("Should log in to LDAP environment", () => {


            UserAndAccessSteps.visit();
            UserAndAccessSteps.getToggleSecuritySwitch().click();
            LoginSteps.visitLoginPage();
            LoginSteps.loginWithUser("onto-user", "ontotext");

        });

    afterEach(() => {
        // Clean up repository
        cy.loginAsLDAPAdmin().then(() => {
            cy.deleteRepository(testRepo, true);
            // cy.deleteUser(graphqlUser, true);
            cy.switchOffFreeAccess(true);
            cy.switchOffSecurity(true);
        }); });


});
