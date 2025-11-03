import {MainMenuSteps} from "../../../steps/main-menu-steps";
import {UserAndAccessSteps} from "../../../steps/setup/user-and-access-steps";
import {LoginSteps} from "../../../steps/login-steps";
import {ToasterSteps} from "../../../steps/toaster-steps";

describe('Turn on Security', () => {

    beforeEach(() => {
        cy.loginAsAdmin();
        cy.switchOnSecurity();
    });

    afterEach(() =>{
        cy.loginAsAdmin();
        cy.switchOffSecurity(true);
    })

  it('should enable security and show login screen with only Help accessible', () => {
    // Navigate to Users & Access
    UserAndAccessSteps.visit();
    // Verify we are redirected to login page
    cy.url().should('include', '/login');
    MainMenuSteps.getMenuHelp().should('not.exist');
    MainMenuSteps.getMenuExplore().should('not.exist');
    MainMenuSteps.getMenuMonitoring().should('not.exist');
    MainMenuSteps.getMenuSetup().should('not.exist');
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

  it('should change admin password and enforce new credentials', () => {
    // Navigate to Users & Access after login
    UserAndAccessSteps.visit();
    // Verify we are redirected to login page
    cy.url().should('include', '/login');
    LoginSteps.loginWithUser('admin', 'root');

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
    MainMenuSteps.clickOnUsersAndAccess();
    // Open edit page for admin user
    UserAndAccessSteps.openEditUserPage('admin');
    newPassword = 'root';
    UserAndAccessSteps.typePassword(newPassword);
    UserAndAccessSteps.typeConfirmPasswordField(newPassword);
    UserAndAccessSteps.confirmUserEdit();
  });

  it('should show toaster when after logging out', () => {
      UserAndAccessSteps.visit();
      LoginSteps.loginWithUser('admin', 'root');
      // Log out
      LoginSteps.logout();
      cy.url().should('include', '/login');
      // Verify toaster message
      ToasterSteps.verifySuccess('Signed out');
  })
});
