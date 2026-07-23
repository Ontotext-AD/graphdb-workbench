import {MainMenuSteps} from '../../../steps/main-menu-steps';
import {UserAndAccessSteps} from '../../../steps/setup/user-and-access-steps';
import {LoginSteps} from '../../../steps/login-steps';
import {SecurityStubs} from "../../../stubs/security-stubs.js";


describe('LDAP - CRUD, User Management and Permissions, Corner Cases', () => {
    let testRepo;

    beforeEach(() => {
        cy.loginAsAdmin();

        // cy.loginAsLDAPAdmin();

        // cy.setDefaultUserData();
        // cy.switchOffSecurity(true);
        // SecurityStubs.stubGetLDAPAdminUser();

        // LoginSteps.loginWithUser(LDAPUsername, LDAPPassword);
        // MainMenuSteps.clickOnUsersAndAccess();
        // Navigate to Users & Access
        UserAndAccessSteps.visit();

    });

    // afterEach(() => {
    //     // Clean up repository
    //     cy.deleteRepository(testRepo);
    // });

    it.only('Should validate initial state of page elements when LDAP is configured',() => {
        LoginSteps.visitLoginPage();

        UserAndAccessSteps.getToggleSecurityCheckbox().should('not.be.true');
        UserAndAccessSteps.getToggleSecuritySwitch()

    });

    // it("Should log in to LDAP environment", () => {
    //
    //
    //     LoginSteps.loginWithUser("onto-user", "ontotext");
    //
    // });




});
