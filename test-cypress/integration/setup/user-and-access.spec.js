import {UserAndAccessSteps} from "../../steps/setup/user-and-access-steps";

describe('User and Access', () => {

    const PASSWORD = "password";
    const ROLE_USER = "#roleUser";
    const ROLE_REPO_MANAGER = "#roleRepoAdmin";
    const ROLE_CUSTOM_ADMIN = "#roleAdmin";
    const DEFAULT_ADMIN_PASSWORD = "root";

    beforeEach(() => {
        UserAndAccessSteps.visit();
        cy.window();
        // Users table should be visible
        UserAndAccessSteps.getUsersTable().should('be.visible');
    });

    after(() => {
        UserAndAccessSteps.visit();
        UserAndAccessSteps.getUsersTable().should('be.visible');
        UserAndAccessSteps.getUsersTableRow().then((table) => {
            UserAndAccessSteps.getTableRow().each(($el, index, $list) => {
                UserAndAccessSteps.getUsersTable().should('be.visible');
                const username = $el.find('.username').text();
                if (username !=='admin') {
                    UserAndAccessSteps.deleteUser(username);
                }
            });
        });
    });

    it('Initial state', () => {
        // Create new user button should be visible
        UserAndAccessSteps.getCreateNewUserButton().should('be.visible');
        // Security should be disabled
        UserAndAccessSteps.getSecuritySwitchLabel().should('be.visible').and('contain', 'Security is OFF');
        UserAndAccessSteps.getSecurityCheckbox().should('not.be.checked');
        // Only admin user should be created by default
        UserAndAccessSteps.getTableRow().should('have.length', 1);
        UserAndAccessSteps.findUserInTable('admin');
        UserAndAccessSteps.getUserType().should('be.visible').and('contain', 'Administrator');
        // The admin should have unrestricted rights
        UserAndAccessSteps.getRepositoryRights().should('be.visible').and('contain', 'Unrestricted');
        // And can be edited
        UserAndAccessSteps.getEditUserButton().should('be.visible').and('not.be.disabled');
        // And cannot be deleted
        UserAndAccessSteps.getDeleteUserButton().should('not.exist');
        // Date created should be visible
        UserAndAccessSteps.getDateCreated().should('be.visible');
    });

    it('Create user', () => {
        const name = "user";
        //create a normal read/write user
        createUser(name, PASSWORD, ROLE_USER);
        testForUser(name, false);
    });

    it('Create repo-manager', () => {
        const name = "repo-manager";
        //create a repo-manager
        createUser(name, PASSWORD, ROLE_REPO_MANAGER);
        testForUser(name, false);
    });

    it('Create second admin', () => {
        const name = "second-admin";
        //create a custom admin
        createUser(name, PASSWORD, ROLE_CUSTOM_ADMIN);
        testForUser(name, true);
    });

    it('Create user with custom role', () => {
        const name = "user";
        // When I create a read/write user
        UserAndAccessSteps.clickCreateNewUserButton();
        UserAndAccessSteps.typeUsername(name);
        UserAndAccessSteps.typePassword(PASSWORD);
        UserAndAccessSteps.typeConfirmPasswordField(PASSWORD);
        UserAndAccessSteps.selectRoleRadioButton(ROLE_USER);
        // And add a custom role of 1 letter
        UserAndAccessSteps.addTextToCustomRoleField('A');
        UserAndAccessSteps.getRepositoryRightsList().contains('Any data repository').nextUntil('.write').eq(1).within(() => {
            UserAndAccessSteps.clickWriteAccess();
        });

        // Then the 'create' button should be disabled
        UserAndAccessSteps.getConfirmUserCreateButton().should('be.disabled');
        // And the field should show an error
        UserAndAccessSteps.getFieldError().should('contain.text', 'Must be at least 2 symbols long');
        // When I add more text to the custom role tag
        UserAndAccessSteps.addTextToCustomRoleField('A{enter}');
        // Then the 'create' button should be enabled
        UserAndAccessSteps.getConfirmUserCreateButton().should('be.enabled');
        // And the field error should not exist
        UserAndAccessSteps.getFieldError().should('not.be.visible');

        // When I type an invalid tag
        UserAndAccessSteps.addTextToCustomRoleField('B{enter}');
        // And the field shows an error
        UserAndAccessSteps.getFieldError().should('contain.text', 'Must be at least 2 symbols long');
        // When I delete the invalid text
        UserAndAccessSteps.addTextToCustomRoleField('{backspace}');
        // Then the error should not be visible
        UserAndAccessSteps.getFieldError().should('not.be.visible');
    });

    it('Adding a role with a CUSTOM_ prefix shows an info message', () => {
        // When I create a user
        UserAndAccessSteps.clickCreateNewUserButton();
        // And I add a custom role tag with prefix CUSTOM_
        UserAndAccessSteps.addTextToCustomRoleField('CUSTOM_USER_FOO{enter}');
        // Then I should see a dialog
        UserAndAccessSteps.getModal().should('be.visible');
        // The dialog should contain a warning text
        UserAndAccessSteps.getModalBody().should('contain', 'The prefix CUSTOM_ is implicitly added on rule creation. If the prefix wasn\'t also added explicitly, it should be removed.');
        // Then I can dismiss the dialog
        UserAndAccessSteps.clickModalOK();
    });

    it('Warn users when setting no password when creating new user admin', () => {
        UserAndAccessSteps.getUsersTable().should('be.visible');
        createUser("adminWithNoPassword", PASSWORD, ROLE_CUSTOM_ADMIN);
        UserAndAccessSteps.getUsersTable().should('be.visible');
        UserAndAccessSteps.getSplashLoader().should('not.be.visible');
        UserAndAccessSteps.deleteUser("adminWithNoPassword");
    });

    function createUser(username, password, role) {
        UserAndAccessSteps.clickCreateNewUserButton();
        UserAndAccessSteps.typeUsername(username);
        UserAndAccessSteps.typePassword(password);
        UserAndAccessSteps.typeConfirmPasswordField(password);
        UserAndAccessSteps.selectRoleRadioButton(role);
        if (role === "#roleUser") {
            UserAndAccessSteps.getRepositoryRightsList().contains('Any data repository').nextUntil('.write').eq(1).within(() => {
                UserAndAccessSteps.clickWriteAccess();
            });
            UserAndAccessSteps.confirmUserCreate();
        } else if (role === "#roleAdmin" && username === "adminWithNoPassword") {
            UserAndAccessSteps.getNoPasswordCheckbox().check()
                .then(() => {
                    UserAndAccessSteps.getNoPasswordCheckbox()
                        .should('be.checked');
                });
            UserAndAccessSteps.getConfirmUserCreateButton().click()
                .then(() => {
                    UserAndAccessSteps.getDialogText().contains('If the password is unset and security is enabled, this administrator will not be ' +
                        'able to log into GraphDB through the workbench. Are you sure that you want to continue?');
                    UserAndAccessSteps.confirmInDialog();
                });
        } else {
            UserAndAccessSteps.confirmUserCreate();
        }
        UserAndAccessSteps.getSplashLoader().should('not.be.visible');
        UserAndAccessSteps.getUsersTable().should('contain', username);
    }

    function testForUser(name, isAdmin) {
        //enable security
        UserAndAccessSteps.toggleSecurity();
        //login new user
        UserAndAccessSteps.loginWithUser(name, PASSWORD);
        //verify permissions
        UserAndAccessSteps.getUrl().should('include', '/users');
        if (isAdmin) {
            UserAndAccessSteps.getUsersTable().should('be.visible');
        } else {
            UserAndAccessSteps.getError().should('contain',
                'You have no permission to access this functionality with your current credentials.');
        }
        UserAndAccessSteps.logout();
        //login with the admin
        UserAndAccessSteps.loginWithUser("admin", DEFAULT_ADMIN_PASSWORD);
        UserAndAccessSteps.getSplashLoader().should('not.be.visible');
        UserAndAccessSteps.getUsersTable().should('be.visible');
        //delete new-user
        UserAndAccessSteps.deleteUser(name);
        //disable security
        UserAndAccessSteps.toggleSecurity();//.click({force: true});
        UserAndAccessSteps.getSecuritySwitchLabel().should('be.visible').and('contain', 'Security is OFF');
        UserAndAccessSteps.getUsersTable().should('be.visible');
    }
});
