import {UserAndAccessSteps} from "../../steps/setup/user-and-access-steps";
import {ModalDialogSteps} from "../../steps/modal-dialog-steps";
import {ToasterSteps} from "../../steps/toaster-steps";
import {RepositoriesStubs} from "../../stubs/repositories/repositories-stubs";

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

    afterEach(() => {
        UserAndAccessSteps.visit();
        UserAndAccessSteps.getToggleSecurityCheckbox()
            .then(($toggle) => {
            if ($toggle.prop('checked')) {
                // Uncheck the security toggle button at the end of each test, if it is checked
                UserAndAccessSteps.toggleSecurity();
            }
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

    it('Adding a role with a CUSTOM_ prefix shows a warning message', () => {
        // When I create a user
        UserAndAccessSteps.clickCreateNewUserButton();
        // And I add a custom role tag with prefix CUSTOM_
        UserAndAccessSteps.addTextToCustomRoleField('CUSTOM_USER{Enter}');
        // There should be a warning text
        UserAndAccessSteps.getPrefixWarning(0).should('contain', 'Custom roles should be entered without the "CUSTOM_" prefix in Workbench');
    });

    it('Warn users when setting no password when creating new user admin', () => {
        UserAndAccessSteps.getUsersTable().should('be.visible');
        createUser("adminWithNoPassword", PASSWORD, ROLE_CUSTOM_ADMIN);
        UserAndAccessSteps.getUsersTable().should('be.visible');
        UserAndAccessSteps.getSplashLoader().should('not.be.visible');
        UserAndAccessSteps.deleteUser("adminWithNoPassword");
    });

    it('should toggle free access after Admin has logged in', () => {
        // Given I have available repositories to allow Free Access for
        RepositoriesStubs.stubRepositories();
        // When I enable security
        UserAndAccessSteps.toggleSecurity();
        // When I log in as an Admin
        UserAndAccessSteps.loginWithUser("admin", DEFAULT_ADMIN_PASSWORD);
        // Then the page should load
        UserAndAccessSteps.getSplashLoader().should('not.be.visible');
        UserAndAccessSteps.getUsersTable().should('be.visible');
        // The Free Access toggle should be OFF
        UserAndAccessSteps.getFreeAccessSwitchInput().should('not.be.checked');
        // When I toggle Free Access ON
        UserAndAccessSteps.toggleFreeAccess();
        // Then I click OK in the modal
        ModalDialogSteps.clickOKButton();
        // Then the toggle button should be ON
        UserAndAccessSteps.getFreeAccessSwitchInput().should('be.checked');
        // And I should see a success message
        ToasterSteps.verifySuccess('Free access has been enabled.');
        UserAndAccessSteps.getUsersTable().should('be.visible');
        // When I toggle Free Access OFF
        UserAndAccessSteps.toggleFreeAccess();
        // Then I should see a success message
        ToasterSteps.verifySuccess('Free access has been disabled.');
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
