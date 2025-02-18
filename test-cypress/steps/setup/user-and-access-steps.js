export class UserAndAccessSteps {
    static visit() {
        cy.visit('/users');
    }

    static getUrl() {
        return cy.url();
    }

    static getSplashLoader() {
        return cy.get('.ot-splash');
    }

    static getCreateNewUserButton() {
        return cy.get('#wb-users-userCreateLink');
    }

    static clickCreateNewUserButton() {
        this.getCreateNewUserButton().click();
    }

    static getToggleSecuritySwitch() {
        return cy.get('#toggle-security span.switch');
    }

    static getToggleSecurityCheckbox() {
        return cy.get('#toggle-security input[type="checkbox"]');
    }
    static toggleSecurity() {
        this.getToggleSecuritySwitch().click();
    }

    static getFreeAccessSwitchInput() {
        return cy.get('#toggle-freeaccess .switch input');
    }

    static getFreeAccessSwitch() {
        return cy.get('#toggle-freeaccess span.switch');
    }

    static toggleFreeAccess() {
        this.getFreeAccessSwitch().click();
    }

    static getSecuritySwitchLabel() {
        return cy.get('#toggle-security').find('.security-switch-label');
    }

    static getSecurityCheckbox() {
        return cy.get('#toggle-security').find('.switch:checkbox');
    }

    static getUser() {
        return cy.get('@user');
    }

    static getUserType() {
        return this.getUser().find('.user-type');
    }

    static getRepositoryRights() {
        return this.getUser().find('.repository-rights');
    }

    static getEditUserButton() {
        return this.getUser().find('.edit-user-btn');
    }

    static getDeleteUserButton() {
        return this.getUser().find('.delete-user-btn');
    }

    static getDateCreated() {
        return this.getUser().find('.date-created');
    }

    static getUsersTable() {
        return cy.get('#wb-users-userInUsers');
    }

    static getTableRow() {
        return this.getUsersTable().find('tbody tr');
    }

    static getUsersTableRow() {
        return cy.get('#wb-users-userInUsers tr');
    }

    static findUserInTable(username) {
        return this.getUsersTable().find(`tbody .username:contains(${username})`)
            .closest('tr').as('user');
    }

    static getUsernameField() {
        return cy.get('#wb-user-username');
    }

    static typeUsername(text) {
        this.getUsernameField().type(text);
    }

    static getPasswordField() {
        return cy.get('#wb-user-password');
    }

    static typePassword(text) {
        this.getPasswordField().type(text);
    }

    static getConfirmPasswordField() {
        return cy.get('#wb-user-confirmpassword');
    }

    static typeConfirmPasswordField(text) {
        this.getConfirmPasswordField().type(text);
    }

    static getNoPasswordCheckbox() {
        return cy.get('#noPassword:checkbox');
    }

    static getCustomRoleField() {
        return cy.get('tags-input');
    }

    static addTextToCustomRoleField(text) {
        this.getCustomRoleField().type(text);
    }

    static getConfirmUserCreateButton() {
        return cy.get('#wb-user-submit');
    }

    static confirmUserCreate() {
        cy.get('#wb-user-submit').click();
    }

    static getRoleRadioButton(userRole) {
        return cy.get(userRole);
    }

    static selectRoleRadioButton(role) {
        this.getRoleRadioButton(role).click();
    }

    static getRepositoryRightsList() {
        return cy.get('#user-repos');
    }

    static clickWriteAccess() {
        cy.get('.write').click();
    }

    static getFieldError() {
        return cy.get('div.small');
    }

    static getError() {
        return cy.get('.alert-danger');
    }

    static getModal() {
        return cy.get('.modal-dialog');
    }

    static getPrefixWarning() {
        return cy.get('.prefix-warning');
    }

    static getDialogText() {
        return this.getModal().find('.lead');
    }

    static confirmInDialog() {
        this.getModal().find('.confirm-btn').click();
    }

    static deleteUser(username) {
        this.findUserInTable(username);
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

    static loginWithUser(username, password) {
        cy.get('#wb-login-username').type(username);
        cy.get('#wb-login-password').type(password);
        cy.get('#wb-login-submitLogin').click();
    }

    static logout() {
        cy.get('#btnGroupDrop2').click();
        cy.get('.dropdown-item')
            .contains('Logout')
            .closest('a')
            // Force the click because Cypress sometimes determines that the item has 0x0 dimensions
            .click({force: true});
    }

    static clickGraphqlAccessForRepo(repoName) {
        if (repoName === '*') {
            cy.get('#user-repos')
                .contains('Any data repository')
                .parent('tr')
                .find('.graphql')
                .click();
        } else {
            cy.get('#user-repos')
                .contains(repoName)
                .parent('tr')
                .find('.graphql')
                .click();
        }
    }

    static clickReadAccessForRepo(repoName) {
        if (repoName === '*') {
            cy.get('#user-repos')
                .contains('Any data repository')
                .parent('tr')
                .find('.read')
                .click();
        } else {
            cy.get('#user-repos')
                .contains(repoName)
                .parent('tr')
                .find('.read')
                .click();
        }
    }

    static clickWriteAccessForRepo(repoName) {
        if (repoName === '*') {
            cy.get('#user-repos')
                .contains('Any data repository')
                .parent('tr')
                .find('.write')
                .click();
        } else {
            cy.get('#user-repos')
                .contains(repoName)
                .parent('tr')
                .find('.write')
                .click();
        }
    }

    static findUserRowAlias(username, aliasName = 'userRow') {
        this.findUserInTable(username);
        cy.get('@user').as(aliasName);
        return cy.get('@' + aliasName);
    }

    static findRepoLineAlias(userRowAlias, matchText, repoLineAlias = 'repoLine') {
       return this.getRepoLine(userRowAlias, matchText).as(repoLineAlias);
    }

    static getRepoLine(userRowAlias, matchText) {
        return cy.get(userRowAlias)
            .find('.repository-rights > div')
            .filter(`:contains("${matchText}")`)
    }

    static findReadIconAlias(repoLineAlias) {
        return cy.get(repoLineAlias).find('.icon-eye');
    }

    static findWriteIconAlias(repoLineAlias) {
        return cy.get(repoLineAlias).find('.icon-edit');
    }

    static findGraphqlIconAlias(repoLineAlias) {
        return cy.get(repoLineAlias).find('.fa-gdb-graphql');
    }

    static openEditUserPage(username) {
        this.findUserInTable(username); // sets @user
        cy.get('@user').find('.edit-user-btn').click();
    }

    static confirmUserEdit() {
        cy.get('#wb-user-submit').click();
    }

    static getReadAccessForRepo(repoName) {
        const matchText = (repoName === '*') ? 'Any data repository' : repoName;
        return cy.get('#user-repos')
            .contains(matchText)
            .parent('tr')
            .find('.read[type="checkbox"]')
    }

    static toggleReadAccessForRepo(repoName) {
        return this.getReadAccessForRepo(repoName).click({ force: true });
    }

    static getWriteAccessForRepo(repoName) {
        const matchText = (repoName === '*') ? 'Any data repository' : repoName;
        return cy.get('#user-repos')
            .contains(matchText)
            .parent('tr')
            .find('.write[type="checkbox"]')
    }

    static toggleWriteAccessForRepo(repoName) {
        return this.getWriteAccessForRepo(repoName).click({ force: true });
    }

    static getGraphqlAccessForRepo(repoName) {
        const matchText = (repoName === '*') ? 'Any data repository' : repoName;
        return cy.get('#user-repos')
            .contains(matchText)
            .parent('tr')
            .find('.graphql[type="checkbox"]')
    }

    static toggleGraphqlAccessForRepo(repoName) {
        return this.getGraphqlAccessForRepo(repoName).click({ force: true });
    }
}
