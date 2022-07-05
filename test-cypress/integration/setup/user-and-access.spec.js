describe('User and Access', () => {

    const PASSWORD = "password";
    const ROLE_USER = "#roleUser";
    const ROLE_REPO_MANAGER = "#roleRepoAdmin";
    const ROLE_CUSTOM_ADMIN = "#roleAdmin";
    const DEFAULT_ADMIN_PASSWORD = "root";

    beforeEach(() => {
        cy.visit('/users');
        cy.window();
        // Users table should be visible
        getUsersTable().should('be.visible');
    });

    after(() => {
        cy.visit('/users');
        getUsersTable().should('be.visible');
        cy.get('#wb-users-userInUsers tr').then((table) => {
            cy.get('table > tbody  > tr').each(($el, index, $list) => {
                getUsersTable().should('be.visible');
                const username = $el.find('.username').text();
                if (username !=='admin') {
                    deleteUser(username);
                }
            });
        });
    });

    it('Initial state', () => {
        // Create new user button should be visible
        getCreateNewUserButton().should('be.visible');
        // Security should be disabled
        cy.get('#toggle-security').find('.security-switch-label').should('be.visible')
            .and('contain', 'Security is OFF');
        cy.get('#toggle-security').find('.switch:checkbox').should('not.be.checked');
        // Only admin user should be created by default
        getUsersTable().find('tbody tr').should('have.length', 1);
        findUserInTable('admin');
        cy.get('@user').find('.user-type').should('be.visible')
            .and('contain', 'Administrator');
        // The admin should have unrestricted rights
        cy.get('@user').find('.repository-rights').should('be.visible')
            .and('contain', 'Unrestricted');
        // And can be edited
        cy.get('@user').find('.edit-user-btn').should('be.visible')
            .and('not.be.disabled');
        // And cannot be deleted
        cy.get('@user').find('.delete-user-btn').should('not.exist');
        // Date created should be visible
        cy.get('@user').find('.date-created').should('be.visible');
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

    function testForUser(name, isAdmin) {
        //enable security
        getToggleSecuritySwitch().click();

        loginWithUser(name, PASSWORD);
        //verify permissions
        cy.url().should('include', '/users');
        if (!isAdmin) {
            cy.get('.alert-danger').should('contain',
                'You have no permission to access this functionality with your current credentials.');
        } else {
            getUsersTable().should('be.visible');
        }
        logout();
        //login with the admin
        loginWithUser("admin", DEFAULT_ADMIN_PASSWORD);
        cy.get('.ot-splash').should('not.be.visible');
        getUsersTable().should('be.visible');
        //delete new-user
        deleteUser(name);
        //disable security
        getToggleSecuritySwitch().click({force: true});
    }

    it('Warn users when setting no password when creating new user admin', () => {
        getUsersTable().should('be.visible');
        createUser("adminWithNoPassword", PASSWORD, ROLE_CUSTOM_ADMIN);
        getUsersTable().should('be.visible');
        cy.get('.ot-splash').should('not.be.visible');
        deleteUser("adminWithNoPassword");
    });

    function getCreateNewUserButton() {
        return cy.get('#wb-users-userCreateLink');
    }

    function getToggleSecuritySwitch() {
        return cy.get('#toggle-security span.switch');
    }

    function getUsersTable() {
        return cy.get('#wb-users-userInUsers');
    }

    function findUserInTable(username) {
        return getUsersTable().find(`tbody .username:contains(${username})`)
            .closest('tr').as('user');
    }

    function getUsernameField() {
        return cy.get('#wb-user-username');
    }

    function getPasswordField() {
        return cy.get('#wb-user-password');
    }

    function getConfirmPasswordField() {
        return cy.get('#wb-user-confirmpassword');
    }

    function getConfirmUserCreateButton() {
        return cy.get('#wb-user-submit');
    }

    function getRoleRadioButton(userRole) {
        return cy.get(userRole);
    }

    function getRepoitoryRightsList() {
        return cy.get('#user-repos');
    }

    function createUser(username, password, role) {
        getCreateNewUserButton().click();
        getUsernameField().type(username);
        getPasswordField().type(password);
        getConfirmPasswordField().type(password);
        getRoleRadioButton(role).click();
        if (role === "#roleUser") {
            getRepoitoryRightsList().contains('Any data repository').nextUntil('.write').within(() => {
                cy.get('.write').click();
            });
            getConfirmUserCreateButton().click();
        } else if (role === "#roleAdmin" && username === "adminWithNoPassword") {
            cy.get('#noPassword:checkbox').check()
                .then(() => {
                    cy.get('#noPassword:checkbox')
                        .should('be.checked');
                });
            getConfirmUserCreateButton().click()
                .then(() => {
                    cy.get('.modal-dialog').find('.lead').contains('If the password is unset and security is enabled, this administrator will not be ' +
                        'able to log into GraphDB through the workbench. Are you sure that you want to continue?');
                    cy.get('.modal-dialog').find('.confirm-btn').click();
                });
        } else {
            getConfirmUserCreateButton().click();
        }
        cy.get('.ot-splash').should('not.be.visible');
        getUsersTable().should('contain', username);
    }

    function deleteUser(username) {
        findUserInTable(username);
        cy.get('@user')
            .should('have.length', 1)
            .within(() => {
                cy.get('.delete-user-btn')
                    .as('deleteBtn');
            });
        return cy.waitUntil(() =>
            cy.get('@deleteBtn')
                .then((deleteBtn) => deleteBtn && Cypress.dom.isAttached(deleteBtn) && deleteBtn.trigger('click')))
            .then(() => {
                cy.get('.confirm-btn').click();
            });
    }

    function loginWithUser(username, password) {
        do {
            cy.get('#wb-login-username').type(username);
            cy.get('#wb-login-password').type(password);
            cy.get('#wb-login-submitLogin').click({force: true});
            if (cy.url().toString().endsWith('/users')) return;
        } while (cy.url().toString().endsWith('/login'));
        //Sometimes after login we are redirected to home '/'
        cy.visit('/users');
    }

    function logout() {
        cy.get('#btnGroupDrop2').click();
        cy.get('.dropdown-item')
            .contains('Logout')
            .closest('a')
            // Force the click because Cypress sometimes determines that the item has 0x0 dimensions
            .click({force: true});
    }
});
