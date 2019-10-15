describe('User and Access', () => {

    let repositoryId;
    let user = "user";
    let repoManager = "repoManager";
    let admin = "admin-new";
    let password = "1234";
    let adminPassword = "root";

    beforeEach(() => {
    //create/delete repo before/after each tests, due to cy.visit making the tests flaky.
        repositoryId = 'setup-repo' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepositoryCookie(repositoryId);
        cy.visit('/users');
        // Users table should be visible
        getUsersTable().should('be.visible');
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Initial state', () => {
        // Create new user button should be visible
        getCreateNewUserButton().should('be.visible');
        // Security should be disabled
        getToggleSecuritySwitch().find('.security-switch-label').should('be.visible')
            .and('contain', 'Security is OFF');
        getToggleSecuritySwitch().find('.switch:checkbox').should('not.be.checked');
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
        cy.get('@user').find('.delete-user-btn').should('not.be.visible');
        // Date created should be visible
        cy.get('@user').find('.date-created').should('be.visible');
    });

    it('Create user - read-only and verify that security works - /import', () => {
        cy.wait(500); //sometimes repositories list cannot be fetched.
        createUser(user, "roleUser", "read");
        getSecuritySwitch().click({force:true});
        performLogin(user, password);
        //when logging in with a non admin user you will be redirected to the last page you logged out from and in this case the user does not have rights to view it.
        cy.url()
            .should('eq', Cypress.config('baseUrl') + '/users');
        cy.get('.container-fluid')
            .should('contain', 'You have no permission to access this functionality with your current credentials');
        //verify user rights
        getMenuItem("Repositories")
            .should('not.be.visible');
        getMenuItem("Users and Access")
            .should('not.be.visible');
        //verify no access message is displayed
        getNoPermissionMessage("/import")
            .should('be.visible')
            .and('contain', 'Some functionality is not available because you have no write permission to repository ' + repositoryId);
        logOutAndDeleteUser(user);
    });

    it('Create user - read-only and verify that security works - /connectors', () => {
        cy.wait(500); //sometimes repositories list cannot be fetched.
        createUser(user, "roleUser", "read");
        getSecuritySwitch().click({force:true});
        performLogin(user, password);
        //when logging in with a non admin user you will be redirected to the last page you logged out from and in this case the user does not have rights to view it.
        cy.url()
            .should('eq', Cypress.config('baseUrl') + '/users');
        cy.get('.container-fluid')
            .should('contain', 'You have no permission to access this functionality with your current credentials');
        //verify user rights
        getMenuItem("Repositories")
            .should('not.be.visible');
        getMenuItem("Users and Access")
            .should('not.be.visible');
        //verify no access message is displayed
        getNoPermissionMessage("/connectors")
            .should('be.visible')
            .and('contain', 'Some functionality is not available because you have no write permission to repository ' + repositoryId);
        logOutAndDeleteUser(user);
    });

    it('Create user - read-only and verify that security works - /autocomplete', () => {
        cy.wait(500); //sometimes repositories list cannot be fetched.
        createUser(user, "roleUser", "read");
        getSecuritySwitch().click({force:true});
        performLogin(user, password);
        //when logging in with a non admin user you will be redirected to the last page you logged out from and in this case the user does not have rights to view it.
        cy.url()
            .should('eq', Cypress.config('baseUrl') + '/users');
        cy.get('.container-fluid')
            .should('contain', 'You have no permission to access this functionality with your current credentials');
        //verify user rights
        getMenuItem("Repositories")
            .should('not.be.visible');
        getMenuItem("Users and Access")
            .should('not.be.visible');
        //verify no access message is displayed
        getNoPermissionMessage("/autocomplete")
            .should('be.visible')
            .and('contain', 'Some functionality is not available because you have no write permission to repository ' + repositoryId);
        logOutAndDeleteUser(user);
    });

    it('Create user - read-only and verify that security works - /rdf-rank', () => {
        cy.wait(500); //sometimes repositories list cannot be fetched.
        createUser(user, "roleUser", "read");
        getSecuritySwitch().click({force:true});
        performLogin(user, password);
        //when logging in with a non admin user you will be redirected to the last page you logged out from and in this case the user does not have rights to view it.
        cy.url()
            .should('eq', Cypress.config('baseUrl') + '/users');
        cy.get('.container-fluid')
            .should('contain', 'You have no permission to access this functionality with your current credentials');
        //verify user rights
        getMenuItem("Repositories")
            .should('not.be.visible');
        getMenuItem("Users and Access")
            .should('not.be.visible');
        //verify no access message is displayed
        getNoPermissionMessage("/rdfrank")
            .should('be.visible')
            .and('contain', 'Some functionality is not available because you have no write permission to repository ' + repositoryId);
        logOutAndDeleteUser(user);
    });

    it('Create user - read/write', () => {
        cy.wait(500); //sometimes repositories list cannot be fetched.
        createUser(user, "roleUser", "write");
        getSecuritySwitch().click({force:true});
        performLogin(user, password);
        getMenuItem("Repositories")
            .should('not.be.visible');
        getMenuItem("Users and Access")
            .should('not.be.visible');
        getNoPermissionMessage("/import")
            .should('not.be.visible');
        getNoPermissionMessage("/connectors")
            .should('not.be.visible');
        getNoPermissionMessage("/autocomplete")
            .should('not.be.visible');
        getNoPermissionMessage("/rdfrank")
            .should('not.be.visible');
        logOutAndDeleteUser(user);
    });

    it('Create user - repository manager', () => {
        createUser(repoManager, "roleRepoAdmin", "");
        getSecuritySwitch().click({force:true});
        performLogin(repoManager, password);+
        getNoPermissionMessage("/import")
            .should('not.be.visible');
        getNoPermissionMessage("/connectors")
            .should('not.be.visible');
        getNoPermissionMessage("/autocomplete")
            .should('not.be.visible');
        getNoPermissionMessage("/rdfrank")
            .should('not.be.visible');
        getMenuItem("Repositories")
            .should('be.visible');
        getMenuItem("Users and Access")
            .should('not.be.visible');

        logOutAndDeleteUser(repoManager);
    });

    it('Create user - admin', () => {
        createUser(admin, "roleAdmin", "");
        getSecuritySwitch().click({force:true});
        performLogin(admin, password);
        getNoPermissionMessage("/import")
            .should('not.be.visible');
        getNoPermissionMessage("/connectors")
            .should('not.be.visible');
        getNoPermissionMessage("/autocomplete")
            .should('not.be.visible');
        getNoPermissionMessage("/rdfrank")
            .should('not.be.visible');
        getMenuItem("Repositories")
            .should('be.visible');
        getMenuItem("Users and Access")
            .should('be.visible');
        logOutAndDeleteUser(admin);
    });

    function getCreateNewUserButton() {
        return cy.get('#wb-users-userCreateLink');
    }

    function getToggleSecuritySwitch() {
        return cy.get('#toggle-security');
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

    function getCreateButton() {
        return cy.get('#wb-user-submit');
    }

    function getUserRoles() {
        return cy.get('#user-roles');
    }

    function getUserRoleRadioButton(role) {
        return getUserRoles().find('#' + role);
    }

    function getRepositoryRights(repoName, userRights) {
        return cy.get(`tr:contains(${repositoryId})`).find("." + userRights );
    }

    function getDeleteUserButton(username) {
        return cy.get(`tr:contains(${username})`).find('.icon-trash');
    }

    function getDeleteUserConfirmButton() {
        return cy.get('.confirm-btn');
    }

    function getSecuritySwitch() {
        return cy.get('#toggle-security span .switch');
    }

    function getLoginUsernameField() {
        return cy.get('#wb-login-username');
    }

    function getLoginPasswordField() {
        return cy.get('#wb-login-password');
    }

    function getUserLoginButton() {
        return cy.get('#wb-login-submitLogin');
    }

    function performLogin(username, password) {
        getLoginUsernameField().type(username);
        getLoginPasswordField().type(password);
        getUserLoginButton().click();
    }

    function getUserLogoutButton() {
        cy.get('#btnGroupDrop2').click();
        return cy.get('a.dropdown-item.logout-button');
    }

    function getToast() {
        return cy.get('#toast-container');
    }

    function getMenuItem(menuItem) {
        return cy.get('.sub-menu-item').contains(menuItem);
    }

    function getNoPermissionMessage(pageToVerify) {
        cy.presetRepositoryCookie(repositoryId);
        cy.visit(pageToVerify);
        return cy.get('.repository-errors');
    }

    function createUser(username, role, rights) {
        getCreateNewUserButton().click();
        getUsernameField().type(username);
        getPasswordField().type(password);
        getConfirmPasswordField().type(password);
        getUserRoleRadioButton(role).click();
        //conditional below is to filter cases where creating admin or repo-manager, as they have full repository rights.
        if(username == "user") {
            getRepositoryRights(repositoryId, rights).click();
        }
        getCreateButton()
            .should('be.visible')
            .click();
        findUserInTable(username);
    }

    function logOutAndDeleteUser(username) {
        cy.visit('/users');
        getUserLogoutButton().click();
        performLogin("admin", adminPassword);
        getDeleteUserButton(username).click();
        getDeleteUserConfirmButton().click();
        getSecuritySwitch().click({force:true});
    }

});
