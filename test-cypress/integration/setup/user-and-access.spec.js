describe('User and Access', () => {

    let repositoryId;
    let user = "user";
    let repoManager = "repoManager";
    let admin = "admin-new";
    let password = "1234";

    before(() => {
        repositoryId = 'setup-repo' + Date.now();
        cy.createRepository({id: repositoryId});
    });

    beforeEach(() => {
        cy.presetRepositoryCookie(repositoryId);

        cy.visit('/users');
        // Users table should be visible
        getUsersTable().should('be.visible');
    });

    after(() => {
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

    it('Create user - read-only', () => {
        getCreateNewUserButton().click();
        getUsernameField().type(user);
        getPasswordField().type(password);
        getConfirmPasswordField().type(password);
        getUserRoleRadioButton("roleUser").click();
        getRepositoryRights(repositoryId, "read").click();
        getCreateButton()
            .should('be.visible')
            .click();
        findUserInTable(user);
        getSecuritySwitch().click({force:true});
        getLoginUsernameField().type(user);
        getLoginPasswordField().type(password);
        getUserLoginButton().click();
        cy.url().should('eq', Cypress.config('baseUrl') + '/users');
        cy.get('.container-fluid').should('contain', 'You have no permission to access this functionality with your current credentials')
        getDeleteUserButton(user).click();
        getDeleteUserConfirmButton().click();
    });

    it('Create user - read/write', () => {
        getCreateNewUserButton().click();
        getUsernameField().type(user);
        getPasswordField().type(password);
        getConfirmPasswordField().type(password);
        getUserRoleRadioButton("roleUser").click();
        getRepositoryRights(repositoryId, "write").click();
        getCreateButton()
            .should('be.visible')
            .click();
        findUserInTable(user);
        getDeleteUserButton(user).click();
        getDeleteUserConfirmButton().click();
    });

    it('Create user - repository manager', () => {
        getCreateNewUserButton().click();
        getUsernameField().type(repoManager);
        getPasswordField().type(password);
        getConfirmPasswordField().type(password);
        getUserRoleRadioButton("roleRepoAdmin").click();
        getCreateButton()
            .should('be.visible')
            .click();
        findUserInTable(repoManager);
        getDeleteUserButton(repoManager).click();
        getDeleteUserConfirmButton().click();
    });

    it('Create user - admin', () => {
        getCreateNewUserButton().click();
        getUsernameField().type(admin);
        getPasswordField().type(password);
        getConfirmPasswordField().type(password);
        getUserRoleRadioButton("roleAdmin").click();
        getCreateButton()
            .should('be.visible')
            .click();
        findUserInTable(admin);
        getDeleteUserButton(admin).click();
        getDeleteUserConfirmButton().click();
    });

    it('Enable security and login with read-only user', () => {
        getSecuritySwitch().click();
        getLoginUsernameField().type()

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
});
