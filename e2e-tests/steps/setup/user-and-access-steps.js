import {EnvironmentStubs} from "../../stubs/environment-stubs";

export class UserAndAccessSteps {
    static visit() {
        cy.visit('/users');
    }

    static visitInProdMode() {
        cy.visit('/users', {
            onBeforeLoad: () => {
                EnvironmentStubs.stubWbProdMode();
            }
        });
    }

    static getUsersCatalogContainer() {
        return cy.get('#wb-users');
    }

    static getUrl() {
        return cy.url();
    }

    static isUsersUrlLoaded() {
        return this.getUrl().should('include', '/users');
    }

    static getSplashLoader() {
        return cy.get('.ot-loader-new-content');
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

    static getUserCustomRoles(userRow) {
        return cy.get(userRow).getByTestId('custom-roles').getByTestId('custom-role');
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

    static getRepositoryRightsLine(repoName) {
        if (repoName === '*') {
            return this.getRepositoryRightsList().find('.any-repo');
        } else {
            return this.getRepositoryRightsList().contains(repoName).parent('tr');
        }
    }

    static getCustomRoleFieldError() {
        return cy.get('#user-custom-roles').find('small');
    }

    /**
     * Returns the feedback <div> for the given login field error.
     * @param field One of "username", "password", "confirmPassword"
     */
    static getUserFieldError(field) {
        return cy.get(`.login-credentials [ng-show="${field}Error"].form-control-feedback`);
    }

    static getRepositoryRightsError() {
        return this.getRepositoryRightsList().find('[ng-show="repositoryCheckError"].form-control-feedback');
    }

    static getError() {
        return cy.get('.alert-danger');
    }

    static getPermissionError() {
        return cy.getByTestId('restricted-access-banner');
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
        this.getRepositoryRightsLine('*')
            .find('.graphql')
            .realClick();
    }

    static clickGraphqlAccessRepo(repoName) {
        this.getRepositoryRightsLine(repoName)
            .find('.graphql')
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
        return cy.get(repoLineAlias).find('.ri-eye-line');
    }

    static findWriteIconAlias(repoLineAlias) {
        return cy.get(repoLineAlias).find('.ri-edit-line');
    }

    static findGraphqlIconAlias(repoLineAlias) {
        return cy.get(repoLineAlias).find('.icon-graphql');
    }

    static openEditUserPage(username) {
        this.findUserInTable(username); // sets @user
        cy.get('@user').find('.edit-user-btn').click();
    }

    static confirmUserEdit() {
        cy.get('#wb-user-submit').click();
    }

    static validateRightsForRepo(repoName, checkbox, expectedState) {
        const {checked, disabled} = expectedState;
        if (checked === true) {
            checkbox.should('be.checked');
        } else if (checked === false) {
            checkbox.should('not.be.checked');
        }
        if (disabled === true) {
            checkbox.should('be.disabled');
        } else if (disabled === false) {
            checkbox.should('not.be.disabled');
        }
    }

    // ============= Read Access Toggles and Validations =============

    static getReadAccessForRepo(repoName) {
        return this.getRepositoryRightsLine(repoName)
            .find('.read')
    }

    static toggleReadAccessAny() {
        UserAndAccessSteps.toggleReadAccessForRepo('*');
    }

    static toggleReadAccessForRepo(repoName) {
        return this.getReadAccessForRepo(repoName).realClick();
    }

    static validateReadAccessForRepo(repoName, expectedState) {
        const readAccessCheckbox = this.getReadAccessForRepo(repoName);
        this.validateRightsForRepo(repoName, readAccessCheckbox, expectedState);
    }

    // ============= Write Access Toggles and Validations =============

    static getWriteAccessForRepo(repoName) {
        return this.getRepositoryRightsLine(repoName)
            .find('.write')
    }

    static toggleWriteAccessAny() {
        UserAndAccessSteps.toggleWriteAccessForRepo('*');
    }

    static toggleWriteAccessForRepo(repoName) {
        return this.getWriteAccessForRepo(repoName).realClick();
    }

    static validateWriteAccessForRepo(repoName, expectedState) {
        const writeAccessCheckbox = this.getWriteAccessForRepo(repoName);
        this.validateRightsForRepo(repoName, writeAccessCheckbox, expectedState);
    }

    // ============= Manange Repository Access Toggles and Validations =============

    static getManageAccessRepoCheckbox(repoName) {
        return this.getRepositoryRightsLine(repoName)
            .find('.manage-repository');
    }

    static clickManageAccessRepo(repoName) {
        UserAndAccessSteps.getManageAccessRepoCheckbox(repoName).realClick();
    }

    static toggleManageRepoForRepo(repoName) {
        return this.clickManageAccessRepo(repoName);
    }

    static validateManageAccessForRepo(repoName, expectedState) {
        const manageAccessCheckbox = this.getManageAccessRepoCheckbox(repoName);
        this.validateRightsForRepo(repoName, manageAccessCheckbox, expectedState);
    }

    // ============= GraphQL Access Toggles and Validations =============

    static getGraphqlAccessForRepo(repoName) {
        return this.getRepositoryRightsLine(repoName)
            .find('.graphql')
    }

    static toggleGraphqlAccessForRepo(repoName) {
        return this.getGraphqlAccessForRepo(repoName).realClick();
    }

    static validateGraphqlAccessForRepo(repoName, expectedState) {
        const graphqlAccessCheckbox = this.getGraphqlAccessForRepo(repoName);
        this.validateRightsForRepo(repoName, graphqlAccessCheckbox, expectedState);
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
        cy.get('.repo-fields').contains(repoName).parent('.row').as('row');
        cy.get('@row').scrollIntoView();
        cy.get('@row').find('.write').realClick();
    }

    static clickFreeGraphqlAccessRepo(repoName) {
        cy.get('.repo-fields').contains(repoName).parent('.row').as('row');
        cy.get('@row').scrollIntoView();
        cy.get('@row').find('.graphql').realClick();
    }

}
