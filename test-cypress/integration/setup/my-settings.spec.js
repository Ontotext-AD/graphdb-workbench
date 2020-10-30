describe('My Settings', () => {

    let repositoryId;

    before(() => {
        repositoryId = 'repo' + Date.now();
        cy.createRepository({id: repositoryId});
    });

    beforeEach(() => {
        cy.presetRepository(repositoryId);

        cy.visit('/settings');
        // Wait for loader to disappear
        cy.get('.ot-loader').should('not.be.visible');
    });

    after(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Initial state', () => {
        // Everything should be related to admin user.
        // Password change field is for admin.
        cy.get('.login-credentials').should('be.visible');
        cy.get('#wb-user-username').should('be.visible')
            .and('have.value', 'admin')
            .and('have.attr', 'readonly', 'readonly');
        // explicitly state that the fields must be of type password
        cy.get('#wb-user-password:password').should('be.visible')
            .and('have.value', '')
            .and('have.attr', 'placeholder', 'New password');
        cy.get('#wb-user-confirmpassword:password').should('be.visible')
            .and('have.value', '')
            .and('have.attr', 'placeholder', 'Confirm password');

        // SPARQL settings are as follows:
        // -Expand over sameAs is on
        // -Inference is on
        // -Count total results is checked
        // -Ignore saved queries is not checked
        cy.get('.sparql-editor-settings').should('be.visible');
        cy.get('#sameas-on').find('.switch:checkbox').should('be.checked');
        cy.get('.sameas-label').should('be.visible')
            .and('contain', 'Expand results over owl:SameAs is')
            .find('.tag').should('be.visible')
            .and('contain', 'ON');
        cy.get('#inference-on').find('.switch:checkbox').should('be.checked');
        cy.get('.inference-label').should('be.visible')
            .and('contain', 'Inference is')
            .find('.tag').should('be.visible')
            .and('contain', 'ON');
        cy.get('#defaultCount:checkbox').should('be.checked');
        cy.get('#ignore-shared:checkbox').should('not.be.checked');

        // User role
        // - User role is administrator (both cannot be changed)
        getUserRoleButtonGroup().should('be.visible')
            .find('#roleAdmin:radio')
            .should('be.checked')
            .and('be.disabled')
            .and('have.value', 'admin');
        getUserRoleButtonGroup().find('#roleRepoAdmin:radio')
            .should('not.be.checked')
            .and('be.disabled');
        getUserRoleButtonGroup().find('#roleUser:radio')
            .should('not.be.checked')
            .and('be.disabled');

        // Repository rights
        // - Admin has read and write access to all repositories."
        getUserRepositoryTable().should('be.visible');
        getUserRepository(repositoryId).find('.read-rights .read:checkbox').should('be.visible')
            .and('be.checked')
            .and('be.disabled');
        getUserRepository(repositoryId).find('.write-rights .write:checkbox').should('be.visible')
            .and('be.checked')
            .and('be.disabled');
    });

    function getUserRepositoryTable() {
        return cy.get('.user-repositories .table');
    }

    function getUserRepository(name) {
        return getUserRepositoryTable().find(`.repository-name:contains('${name}')`).closest('tr');
    }

    function getUserRoleButtonGroup() {
        return cy.get('.user-role');
    }
});
