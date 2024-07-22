describe('Namespaces', () => {

    let repositoryId;
    const DEFAULT_NAMESPACES = {};

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
        getRefreshedTableNamespaces();
        getNamespaces().should('have.length', getDefaultNamespacesLength());

        // Should provide pagination options
        getNamespacesPerPageMenu().within(() => {
            cy.get('.dropdown-toggle')
                .should('contain', 'All')
                .click();
            cy.get('.page-size-option')
                .should('have.length', getPagingCount())
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
            .should('contain', DEFAULT_NAMESPACES['owl']);
        cy.visit('namespaces');
        const updatedCount = getDefaultNamespacesLength();
        getRefreshedTableNamespaces();
        getNamespacesHeaderPaginationInfo()
            .should('be.visible')
            .and('contain', `Showing 1 - ${updatedCount} of ${updatedCount} results`);

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
        getRefreshedTableNamespaces();
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
        getRefreshedTableNamespaces();
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
        getRefreshedTableNamespaces();
        deleteNamespace('xsd');
        confirmModal();
        cy.hideToastContainer();

        getRefreshedTableNamespaces();
        let updatedCount = getDefaultNamespacesLength() - 1;
        // Verify results table is refreshed
        getNamespaces().should('have.length', updatedCount);
        getNamespacesHeaderPaginationInfo()
            .should('contain', `Showing 1 - ${updatedCount} of ${updatedCount} results`);

        selectNamespace('rdf');
        selectNamespace('rdfs');
        getDeleteNamespacesButton().click();
        confirmModal();
        cy.hideToastContainer();

        getRefreshedTableNamespaces();
        updatedCount = updatedCount - 2;
        // Verify results table is refreshed
        getNamespaces().should('have.length', updatedCount);
        getNamespacesHeaderPaginationInfo()
            .should('contain', `Showing 1 - ${updatedCount} of ${updatedCount} results`);

        getSelectAllNamespacesCheckbox().click();
        getDeleteNamespacesButton().click();
        confirmModal();
        cy.hideToastContainer();

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
        return getNamespacesTable().get('[data-cy="delete-several-prefixes"]');
    }

    function getNamespaces() {
        return getNamespacesTable().find('.namespace');
    }

    function getRefreshedTableNamespaces() {
        cy.get('[data-cy="namespaces-per-page-menu"]').click()
            .get('[data-cy="all-label"]').click();
    }

    function getNamespace(prefix) {
        return getNamespacesTable().find('.namespace')
            .should('be.visible')
            .find('.namespace-prefix')
            .should('be.visible')
            .contains(prefix)
            .should('be.visible')
            .parentsUntil('tbody')
            .last();
    }

    function getSelectNamespaceCheckbox(prefix) {
        return getNamespace(prefix)
            .should('be.visible')
            .find('.select-namespace');
    }

    function selectNamespace(prefix) {
        getSelectNamespaceCheckbox(prefix).click();
    }

    function getEditNamespaceButton(prefix) {
        return getNamespace(prefix)
            .should('be.visible')
            .find('.edit-namespace-btn');
    }

    // TODO: Not used yet
    function editNamespace(prefix) {
        getEditNamespaceButton(prefix).click();
    }

    function getDeleteNamespaceButton(prefix) {
        return getNamespace(prefix)
            .should('be.visible')
            .get(`[data-cy="delete-pref_${prefix}"]`)
            .should('be.visible');
    }

    function deleteNamespace(prefix) {
        getDeleteNamespaceButton(prefix).should('be.visible').click();
    }

    // ------ Namespaces pagination ------

    function getNamespacesPagination() {
        return getNamespacesPage().find('.namespaces-pagination .pagination');
    }

    function getDefaultNamespacesLength() {
        return Object.keys(DEFAULT_NAMESPACES).length;
    }

    function getPagingCount() {
        const count = getDefaultNamespacesLength();
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
});
