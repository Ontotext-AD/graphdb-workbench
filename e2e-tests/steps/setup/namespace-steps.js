export class NamespaceSteps {
    static visit() {
        cy.visit('/namespaces');
    }

    static getNamespacesView() {
        return cy.get('#wb-namespaces');
    }

    // ------ Generic ------

    static waitUntilPageIsLoaded() {
        // Workbench loading screen should not be visible
        cy.get('.ot-splash').should('not.be.visible');

        // No active loader
        cy.get('.ot-loader').should('not.be.visible');

        this.getAddNamespaceForm().should('be.visible');
    }

    static getNoNamespacesAlert() {
        return this.getNamespacesView().find('.no-namespaces-alert');
    }

    static getNoNamespacesMatchAlert() {
        return this.getNamespacesView().find('.no-namespaces-match-alert');
    }

    // ------ Add namespaces ------

    static getAddNamespaceForm() {
        return this.getNamespacesView().find('.add-namespace-form');
    }

    static getNamespacePrefixField() {
        return this.getAddNamespaceForm().find('#wb-namespaces-prefix');
    }

    static typeNamespacePrefix(prefix) {
        this.getNamespacePrefixField().type(prefix);
    }

    static getNamespaceValueField() {
        return this.getAddNamespaceForm().find('#wb-namespaces-namespace');
    }

    static typeNamespaceURI(uri) {
        this.getNamespaceValueField().type(uri);
    }

    static getAddNamespaceButton() {
        return this.getAddNamespaceForm().find('#wb-namespaces-addNamespace');
    }

    static addNamespace() {
        this.getAddNamespaceButton().click();
    }

    // ------ Namespaces per page ------

    static getNamespacesPerPageMenu() {
        return cy.get('.namespaces-per-page-menu');
    }

    // ------ Namespaces results header ------

    static getNamespacesResultHeader() {
        return cy.get('.namespaces-result-header');
    }

    static getNamespacesFilterField() {
        return this.getNamespacesResultHeader().find('.namespaces-filter');
    }

    static getNamespacesHeaderPagination() {
        return this.getNamespacesResultHeader().find('.namespaces-header-pagination .pagination');
    }

    static getNamespacesPageElements() {
        return this.getNamespacesHeaderPagination().find('li ')
    }

    static getNamespacePageElement(index) {
        return this.getNamespacesPageElements().eq(index);
    }

    static getNamespacesHeaderPaginationInfo() {
        return this.getNamespacesResultHeader().find('.showing-info-namespaces');
    }

    // ------ Namespaces results ------

    static getNamespacesTable() {
        return cy.get('#wb-namespaces-namespaceInNamespaces');
    }

    static getSelectAllNamespacesCheckbox() {
        return this.getNamespacesTable().find('.select-all-namespaces');
    }

    static getDeleteNamespacesButton() {
        return this.getNamespacesTable().get('[data-cy="delete-several-prefixes"]');
    }

    static getNamespaces() {
        return this.getNamespacesTable().find('.namespace');
    }

    static getNamespacePrefix(index) {
        return this.getNamespaces().eq(index).find('.namespace-prefix').invoke('text');
    }

    static getNamespaceValue(index) {
        return this.getNamespaces().eq(index).find('.namespaceURI').invoke('text');
    }

    static getRefreshedTableNamespaces() {
        cy.get('[data-cy="namespaces-per-page-menu"]').click()
            .get('[data-cy="all-label"]').click();
    }

    static getNamespace(prefix) {
        return this.getNamespacesTable().find('.namespace')
            .should('be.visible')
            .find('.namespace-prefix')
            .should('be.visible')
            .contains(prefix)
            .should('be.visible')
            .parentsUntil('tbody')
            .last();
    }

    static verifyNamespaceNotExist(prefix) {
        return this.getNamespacesTable().find('.namespace')
            .should('be.visible')
            .find('.namespace-prefix')
            .should('be.visible')
            .contains(prefix)
            .should('not.exist');
    }

    static getSelectNamespaceCheckbox(prefix) {
        return this.getNamespace(prefix)
            .should('be.visible')
            .find('.select-namespace');
    }

    static selectNamespace(prefix) {
        this.getSelectNamespaceCheckbox(prefix).click();
    }

    static getEditNamespaceButton(prefix) {
        return this.getNamespace(prefix)
            .should('be.visible')
            .find('.edit-namespace-btn');
    }

    static editNamespaceByIndex(index) {
        this.getNamespaces().eq(index).find('.edit-namespace-btn').click();
    }

    static getInlineNamespacePrefix(index) {
        return this.getNamespaces().eq(index).find('.namespace-prefix').siblings('.editable-text').find('input');
    }

    static typeInlineNamespacePrefix(index, prefix) {
        this.getInlineNamespacePrefix(index).clear().type(prefix);
    }

    static getInlineNamespaceValue(index) {
        return this.getNamespaces().eq(index).find('.namespaceURI').siblings('.editable-url').find('input');
    }

    static typeInlineNamespaceValue(index, namespace) {
        this.getInlineNamespaceValue(index).clear().type(namespace);
    }

    static getSaveInlineNamespaceButton(index) {
        return this.getNamespaces().eq(index).find('button[type="submit"]');
    }

    static saveInlineNamespace(index) {
        this.getSaveInlineNamespaceButton(index).click();
    }

    // TODO: Not used yet
    static editNamespace(prefix) {
        this.getEditNamespaceButton(prefix).click();
    }

    static getDeleteNamespaceButton(prefix) {
        return this.getNamespace(prefix)
            .should('be.visible')
            .get(`[data-cy="delete-pref_${prefix}"]`)
            .should('be.visible');
    }

    static deleteNamespace(prefix) {
        this.getDeleteNamespaceButton(prefix).should('be.visible').click();
    }

    // ------ Namespaces pagination ------

    static getNamespacesPagination() {
        return this.getNamespacesView().find('.namespaces-pagination .pagination');
    }

    static getDefaultNamespacesLength(namespacesObject) {
        return Object.keys(namespacesObject).length;
    }

    static getPagingCount(namespacesObject) {
        const count = this.getDefaultNamespacesLength(namespacesObject);
        if (count <= 10) {
            return 1;
        }
        if (count <= 20) {
            return 2;
        }
        if (count <= 50) {
            return 3;
        }
        if (count <= 100) {
            return 4;
        } else return 5;
    }
}
