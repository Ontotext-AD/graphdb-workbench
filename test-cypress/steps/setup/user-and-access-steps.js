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

    static clickGraphqlAccessAny() {
        cy.get('#user-repos')
            .contains('Any data repository')
            .parent('tr')
            .find('.graphql')
            .realClick();
    }

    static clickGraphqlAccessRepo(repoName) {
        cy.get('#user-repos')
            .contains(repoName)
            .parent('tr')
            .find('.graphql')
            .realClick();
    }

    static clickReadAccessAny() {
        cy.get('#user-repos')
            .contains('Any data repository')
            .parent('tr')
            .find('.read')
            .realClick();
    }

    static clickReadAccessRepo(repoName) {
        cy.get('#user-repos')
            .contains(repoName)
            .parent('tr')
            .find('.read')
            .realClick();
    }

    static clickWriteAccessAny() {
        cy.get('#user-repos')
            .contains('Any data repository')
            .parent('tr')
            .find('.write')
            .realClick();
    }

    static clickWriteAccessRepo(repoName) {
        cy.get('#user-repos')
            .contains(repoName)
            .parent('tr')
            .find('.write')
            .realClick();
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
            .find('.read')
    }

    static toggleReadAccessForRepo(repoName) {
        return this.getReadAccessForRepo(repoName).realClick();
    }

    static getWriteAccessForRepo(repoName) {
        const matchText = (repoName === '*') ? 'Any data repository' : repoName;
        return cy.get('#user-repos')
            .contains(matchText)
            .parent('tr')
            .find('.write')
    }

    static toggleWriteAccessForRepo(repoName) {
        return this.getWriteAccessForRepo(repoName).realClick();
    }

    static getGraphqlAccessForRepo(repoName) {
        const matchText = (repoName === '*') ? 'Any data repository' : repoName;
        return cy.get('#user-repos')
            .contains(matchText)
            .parent('tr')
            .find('.graphql')
    }

    static toggleGraphqlAccessForRepo(repoName) {
        return this.getGraphqlAccessForRepo(repoName).realClick();
    }

    static clickMenuItem(label) {
        return cy.get('.main-menu').contains(label).click({force: true});
    }

    static clickSubmenuItem(label) {
        return cy.get('.sub-menu').contains(label).click({force: true});
    }

    static clickFreeReadAccessRepo(repoName) {
        cy.get('.repo-fields')
            .contains(repoName)
            .parent('.row')
            .find('.read')
            .realClick();
    }

    static clickFreeWriteAccessRepo(repoName) {
        cy.get('.repo-fields')
            .contains(repoName)
            .parent('.row')
            .find('.write')
            .realClick();
    }

    static clickFreeGraphqlAccessRepo(repoName) {
        cy.get('.repo-fields')
            .contains(repoName)
            .parent('.row')
            .find('.graphql')
            .realClick();
    }

}
