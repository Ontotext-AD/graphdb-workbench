describe('Namespaces', () => {

    let repositoryId;
    let DEFAULT_NAMESPACES = {};

    beforeEach(() => {
        repositoryId = 'namespaces-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        cy.initializeRepository(repositoryId);
        cy.getNamespaces(repositoryId)
            .then((response) => {
                response.body.results.bindings.forEach(function (e) {
                    DEFAULT_NAMESPACES[e.prefix.value] = e.namespace.value;
                });
            }).then(() => {

        });

        cy.visit('/namespaces');
        cy.window();

        waitUntilPageIsLoaded();
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    function waitUntilPageIsLoaded() {
        // Workbench loading screen should not be visible
        cy.get('.ot-splash').should('not.be.visible');

        // No active loader
        cy.get('.ot-loader').should('not.be.visible');

        getAddNamespaceForm().should('be.visible');
    }

    it('verify initial state', () => {
        getNoNamespacesAlert().should('not.be.visible');

        // Should be able to insert new prefix
        getNamespacePrefixField().should('be.visible').and('not.be.disabled');
        getNamespaceValueField().should('be.visible').and('not.be.disabled');
        getAddNamespaceButton().should('be.visible').and('not.be.disabled');

        // Should render a table with some default namespaces
        getNamespacesTable().should('be.visible');
        getNamespaces().should('have.length', getDefaultNamespacesLength());

        // Should provide pagination options
        getNamespacesPerPageMenu().within(() => {
            // Should show all namespaces by default (they are only 6 so they can be visualized all at once)
            cy.get('.dropdown-toggle')
                .should('contain', 'All')
                .click();
            cy.get('.page-size-option')
                .should('have.length', 1)
                .and('contain', 'All');
            // Close the menu to avoid overlapping other elements
            cy.get('.dropdown-toggle').click();
        });

        // Should show summary of results
        getNamespacesHeaderPaginationInfo()
            .should('be.visible')
            .and('contain', `Showing 1 - ${getDefaultNamespacesLength()} of ${getDefaultNamespacesLength()} results`);

        // Both header & footer pagination must be the same
        getNamespacesHeaderPagination()
            .should('be.visible')
            .find('li')
            // Single page + First & Last buttons
            .should('have.length', 3);
        getNamespacesPagination()
            .should('be.visible')
            .find('li')
            // Single page + First & Last buttons
            .should('have.length', 3);

        // Verify default namespaces are present and interactable
        const defaultPrefixes = Object.keys(DEFAULT_NAMESPACES).sort(function (a, b) {
            const prefixA = a.toUpperCase(); // ignore upper and lowercase
            const prefixB = b.toUpperCase(); // ignore upper and lowercase
            if (prefixA < prefixB) {
                return -1;
            }
            if (prefixA > prefixB) {
                return 1;
            }
            return 0;
        });
        getNamespaces().each(($row, $index) => {
            const expectedPrefix = defaultPrefixes[$index];
            const expectedNamespace = DEFAULT_NAMESPACES[expectedPrefix];

            cy.wrap($row)
                .find('.namespace-prefix')
                .should('contain', expectedPrefix);

            cy.wrap($row)
                .find('.namespaceURI')
                .should('contain', expectedNamespace);

            cy.wrap($row)
                .find('.select-namespace')
                .should('be.visible')
                .and('not.be.disabled');

            cy.wrap($row)
                .find('.edit-namespace-btn')
                .should('be.visible')
                .and('not.be.disabled');

            cy.wrap($row)
                .find('.delete-namespace-btn')
                .should('be.visible')
                .and('not.be.disabled');
        });
    });

    it('should filter existing namespaces', () => {
        getNamespacesFilterField()
            .should('have.value', '')
            .type('owl')
            .should('have.value', 'owl');
        getNamespaces()
            .should('have.length', 1)
            .and('contain', DEFAULT_NAMESPACES['owl']);
        getNamespacesHeaderPaginationInfo()
            .should('be.visible')
            .and('contain', 'Showing 1 - 1 of 1 results');

        getNamespacesFilterField()
            .clear()
            .type('missing_prefix');
        getNamespacesTable().should('not.be.visible');
        getNoNamespacesMatchAlert().should('be.visible');
    });

    it('should allow to add new namespace', () => {
        const namespacePrefix = 'wine';
        const namespaceUri = 'http://example.com/wine#';

        // Try without providing values
        getAddNamespaceButton().click();
        getToast()
            .find('.toast-error')
            .should('be.visible')
            .and('contain', 'Please provide namespace.');

        // Enter correct values
        getNamespacePrefixField()
            .type(namespacePrefix)
            .should('have.value', namespacePrefix);
        getNamespaceValueField()
            .type(namespaceUri)
            .should('have.value', namespaceUri);
        getAddNamespaceButton().click();

        let updatedCount = getDefaultNamespacesLength() + 1;
        // Verify results table is refreshed
        getNamespaces().should('have.length', updatedCount);
        getNamespacesHeaderPaginationInfo()
            .should('contain', `Showing 1 - ${updatedCount} of ${updatedCount} results`);
        getNamespace(namespacePrefix)
            .should('be.visible')
            .find('.namespaceURI')
            .should('contain', namespaceUri);
    });

    it('should allow to overwrite existing namespace', () => {
        const namespacePrefix = 'wine';
        const namespaceUri = 'http://example.com/wine#';
        const namespaceUriModified = 'http://example.com/wine_example#';

        typeNamespacePrefix(namespacePrefix);
        typeNamespaceURI(namespaceUri);
        addNamespace();

        // Modify the URI & confirm overwrite
        typeNamespacePrefix(namespacePrefix);
        typeNamespaceURI(namespaceUriModified);
        addNamespace();
        confirmModal();

        // Should have not created new record, should update the existing
        getNamespaces()
            .should('have.length', getDefaultNamespacesLength() + 1)
            // This assert here ensures the table will contain the modified namespace before actually checking it because the table is
            // re-rendered and any following checks would hit detached DOM elements
            .and('contain', namespaceUriModified);
        getNamespace(namespacePrefix)
            .should('be.visible')
            .find('.namespaceURI')
            .should('contain', namespaceUriModified);
    });

    it('should allow to delete existing namespaces', () => {
        // Delete single namespace from it's actions
        deleteNamespace('xsd');
        confirmModal();

        let updatedCount = getDefaultNamespacesLength() - 1;
        // Verify results table is refreshed
        getNamespaces().should('have.length', updatedCount);
        getNamespacesHeaderPaginationInfo()
            .should('contain', `Showing 1 - ${updatedCount} of ${updatedCount} results`);

        selectNamespace('rdf');
        selectNamespace('rdfs');
        getDeleteNamespacesButton().click();
        confirmModal();

        updatedCount = updatedCount - 2;
        // Verify results table is refreshed
        getNamespaces().should('have.length', updatedCount);
        getNamespacesHeaderPaginationInfo()
            .should('contain', `Showing 1 - ${updatedCount} of ${updatedCount} results`);

        getSelectAllNamespacesCheckbox().click();
        getDeleteNamespacesButton().click();
        confirmModal();

        getNamespacesTable().should('not.be.visible');
        getNoNamespacesAlert().should('be.visible');
    });

    // ------ Generic ------

    function getNamespacesPage() {
        return cy.get('#wb-namespaces');
    }

    function getNoNamespacesAlert() {
        return getNamespacesPage().find('.no-namespaces-alert');
    }

    function getNoNamespacesMatchAlert() {
        return getNamespacesPage().find('.no-namespaces-match-alert');
    }

    function getToast() {
        return cy.get('#toast-container');
    }

    // TODO: create cy.confirmModal() command ?
    function confirmModal() {
        cy.get('.modal')
            .should('be.visible')
            .and('not.have.class', 'ng-animate')
            .find('.modal-footer .btn-primary')
            .click();
    }

    // ------ Add namespaces ------

    function getAddNamespaceForm() {
        return getNamespacesPage().find('.add-namespace-form');
    }

    function getNamespacePrefixField() {
        return getAddNamespaceForm().find('#wb-namespaces-prefix');
    }

    function typeNamespacePrefix(prefix) {
        getNamespacePrefixField().type(prefix);
    }

    function getNamespaceValueField() {
        return getAddNamespaceForm().find('#wb-namespaces-namespace');
    }

    function typeNamespaceURI(uri) {
        getNamespaceValueField().type(uri);
    }

    function getAddNamespaceButton() {
        return getAddNamespaceForm().find('#wb-namespaces-addNamespace');
    }

    function addNamespace() {
        getAddNamespaceButton().click();
    }

    // ------ Namespaces per page ------

    function getNamespacesPerPageMenu() {
        return cy.get('.namespaces-per-page-menu');
    }

    // ------ Namespaces results header ------

    function getNamespacesResultHeader() {
        return cy.get('.namespaces-result-header');
    }

    function getNamespacesFilterField() {
        return getNamespacesResultHeader().find('.namespaces-filter');
    }

    function getNamespacesHeaderPagination() {
        return getNamespacesResultHeader().find('.namespaces-header-pagination .pagination');
    }

    function getNamespacesHeaderPaginationInfo() {
        return getNamespacesResultHeader().find('.showing-info-namespaces');
    }

    // ------ Namespaces results ------

    function getNamespacesTable() {
        return cy.get('#wb-namespaces-namespaceInNamespaces');
    }

    function getSelectAllNamespacesCheckbox() {
        return getNamespacesTable().find('.select-all-namespaces');
    }

    function getDeleteNamespacesButton() {
        return getNamespacesTable().find('.delete-namespaces-btn');
    }

    function getNamespaces() {
        return getNamespacesTable().find('.namespace');
    }

    function getNamespace(prefix) {
        return getNamespaces()
            .find('.namespace-prefix')
            .contains(prefix)
            .parentsUntil('tbody')
            .last();
    }

    function getSelectNamespaceCheckbox(prefix) {
        return getNamespace(prefix).find('.select-namespace');
    }

    function selectNamespace(prefix) {
        getSelectNamespaceCheckbox(prefix).click();
    }

    function getEditNamespaceButton(prefix) {
        return getNamespace(prefix).find('.edit-namespace-btn');
    }

    // TODO: Not used yet
    function editNamespace(prefix) {
        getEditNamespaceButton(prefix).click();
    }

    function getDeleteNamespaceButton(prefix) {
        return getNamespace(prefix).find('.delete-namespace-btn');
    }

    function deleteNamespace(prefix) {
        getDeleteNamespaceButton(prefix).click();
    }

    // ------ Namespaces pagination ------

    function getNamespacesPagination() {
        return getNamespacesPage().find('.namespaces-pagination .pagination');
    }

    function getDefaultNamespacesLength() {
        return Object.keys(DEFAULT_NAMESPACES).length;
    }
});
