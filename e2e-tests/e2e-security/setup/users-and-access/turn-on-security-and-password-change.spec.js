import {MainMenuSteps} from "../../../steps/main-menu-steps";
import {UserAndAccessSteps} from "../../../steps/setup/user-and-access-steps";
import {LoginSteps} from "../../../steps/login-steps";
import {ToasterSteps} from "../../../steps/toaster-steps";
import {HeaderSteps} from '../../../steps/header-steps.js';
import HomeSteps from '../../../steps/home-steps.js';

describe('Turn on Security', () => {

    beforeEach(() => {
        cy.loginAsAdmin();
        cy.switchOnSecurity();
    });

    afterEach(() => {
        cy.loginAsAdmin();
        cy.switchOffSecurity(true);
    })

    it('should enable security and show login screen', () => {
        // Navigate to Users & Access
        UserAndAccessSteps.visit();
        // Verify we are redirected to login page
        cy.url().should('include', '/login');
        HeaderSteps.getHeader().should('not.exist');
        MainMenuSteps.getMainMenu().should('not.exist');
    });

    it('should reject wrong credentials and accept admin/root', () => {
        // Attempt login with invalid credentials
        LoginSteps.visitLoginPage();
        LoginSteps.loginWithUser('wrongUser', 'wrongPass');
        // Expect error message
        ToasterSteps.verifyNewToasterError('Wrong credentials');

        // Login with correct admin credentials
        LoginSteps.visitLoginPage();
        LoginSteps.loginWithUser('admin', 'root');
        cy.url().should('include', '/');
    });

    it('should show toaster after logging out', () => {
        UserAndAccessSteps.visit();
        LoginSteps.loginWithUser('admin', 'root');
        // Verify we are logged in
        UserAndAccessSteps.getUsersCatalogContainer().should('be.visible');
        // Log out
        HeaderSteps.logout();
        cy.url().should('include', '/login');
        // Verify toaster message
        ToasterSteps.verifySuccess('Signed out');
    })

    describe('Password Change', () => {
        afterEach(() => {
            // Reset password back to original value for test isolation
            UserAndAccessSteps.visit();
            UserAndAccessSteps.openEditUserPage('admin');
            UserAndAccessSteps.typePassword('root');
            UserAndAccessSteps.typeConfirmPasswordField('root');
            UserAndAccessSteps.confirmUserEdit();
            UserAndAccessSteps.getUsersCatalogContainer().should('be.visible');
        })

        it('should change admin password and enforce new credentials', () => {
            // Navigate to Users & Access after login
            UserAndAccessSteps.visit();
            // Verify we are redirected to login page
            cy.url().should('include', '/login');
            // Login with admin credentials
            LoginSteps.loginWithUser('admin', 'root');
            // Verify we are logged in
            UserAndAccessSteps.getUsersCatalogContainer().should('be.visible');

            // Open edit page for admin user
            UserAndAccessSteps.openEditUserPage('admin');

            // Change password to a new value
            let newPassword = 'MyNewP@ssw0rd!';
            UserAndAccessSteps.typePassword(newPassword);
            UserAndAccessSteps.typeConfirmPasswordField(newPassword);
            UserAndAccessSteps.confirmUserEdit();

            // Log out
            LoginSteps.logout();
            cy.url().should('include', '/login');

            // Attempt login with old password
            LoginSteps.loginWithUser('admin', 'root');
            ToasterSteps.verifyNewToasterError('Wrong credentials');

            // Attempt login with new password
            LoginSteps.visitLoginPage();
            LoginSteps.loginWithUser('admin', newPassword);
            // Verify we are logged in and we are on the home page
            HomeSteps.getView().should('be.visible');
        });
    });
});
