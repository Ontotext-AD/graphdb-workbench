describe('User and Access', () => {

    let repositoryId;

    before(() => {
        repositoryId = 'setup-repo' + Date.now();
        cy.createRepository({id: repositoryId});
    });

    beforeEach(() => {
        cy.presetRepository(repositoryId);

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

    it('Create users of each type', () => {
        createUser("user", "pass", "#roleUser");
        createUser("repo-manager", "pass", "#roleRepoAdmin");
        createUser("second-admin", "pass", "#roleAdmin");
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

    function getConfirmUserCreateButton() {
        return cy.get('#wb-user-submit');
    }

    // function getRoleAdminRadioButton() {
    //     return cy.get('#roleRepoAdmin');
    // }
    //
    // function getRoleRepoManagerRadioButton() {
    //     return cy.get('#roleRepoAdmin');
    // }
    //
    // function getRoleUserRadioButton() {
    //     return cy.get('#roleUser');
    // }
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
        if(role == "#roleUser") {
            getRepoitoryRightsList().contains('Any data repository').nextUntil('.write').within(() => {
                cy.get('.write').click();
            });
        }
        getConfirmUserCreateButton().click();

    }
});
