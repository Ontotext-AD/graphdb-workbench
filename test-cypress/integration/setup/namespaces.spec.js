import {NamespaceSteps} from "../../steps/setup/namespace-steps";
import {ApplicationSteps} from "../../steps/application-steps";
import {NamespaceStubs} from "../../stubs/namespace-stubs";
import {ModalDialogSteps} from "../../steps/modal-dialog-steps";

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
            }).then(() => {});

        NamespaceSteps.visit();
        cy.window();

        NamespaceSteps.waitUntilPageIsLoaded();
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('verify initial state', () => {
        NamespaceSteps.getNoNamespacesAlert().should('not.be.visible');

        // Should be able to insert new prefix
        NamespaceSteps.getNamespacePrefixField().should('be.visible').and('not.be.disabled');
        NamespaceSteps.getNamespaceValueField().should('be.visible').and('not.be.disabled');
        NamespaceSteps.getAddNamespaceButton().should('be.visible').and('not.be.disabled');

        // Should render a table with some default namespaces
        NamespaceSteps.getNamespacesTable().should('be.visible');
        NamespaceSteps.getRefreshedTableNamespaces();
        NamespaceSteps.getNamespaces().should('have.length', NamespaceSteps.getDefaultNamespacesLength(DEFAULT_NAMESPACES));

        // Should provide pagination options
        NamespaceSteps.getNamespacesPerPageMenu().within(() => {
            cy.get('.dropdown-toggle')
                .should('contain', 'All')
                .click();
            cy.get('.page-size-option')
                .should('have.length', NamespaceSteps.getPagingCount(DEFAULT_NAMESPACES))
                .and('contain', 'All');
            // Close the menu to avoid overlapping other elements
            cy.get('.dropdown-toggle').click();
        });

        // Should show summary of results
        NamespaceSteps.getNamespacesHeaderPaginationInfo()
            .should('be.visible')
            .and('contain', `Showing 1 - ${NamespaceSteps.getDefaultNamespacesLength(DEFAULT_NAMESPACES)} of ${NamespaceSteps.getDefaultNamespacesLength(DEFAULT_NAMESPACES)} results`);

        // Both header & footer pagination must be the same
        NamespaceSteps.getNamespacesHeaderPagination()
            .should('be.visible')
            .find('li')
            // Single page + First & Last buttons
            .should('have.length', 3);
        NamespaceSteps.getNamespacesPagination()
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
        NamespaceSteps.getNamespaces().each(($row, $index) => {
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

    it('Should filter existing namespaces', () => {
        NamespaceSteps.getNamespacesFilterField()
            .should('have.value', '')
            .type('owl')
            .should('have.value', 'owl');
        NamespaceSteps.getNamespaces()
            .should('contain', DEFAULT_NAMESPACES['owl']);
        cy.visit('namespaces');
        const updatedCount = NamespaceSteps.getDefaultNamespacesLength(DEFAULT_NAMESPACES);
        NamespaceSteps.getRefreshedTableNamespaces();
        NamespaceSteps.getNamespacesHeaderPaginationInfo()
            .should('be.visible')
            .and('contain', `Showing 1 - ${updatedCount} of ${updatedCount} results`);

        NamespaceSteps.getNamespacesFilterField()
            .clear()
            .type('missing_prefix');
        NamespaceSteps.getNamespacesTable().should('not.be.visible');
        NamespaceSteps.getNoNamespacesMatchAlert().should('be.visible');
    });

    it('Should not be able to create a namespace without values', () => {
        NamespaceSteps.addNamespace();
        ApplicationSteps.getErrorNotifications().should('be.visible')
            .and('contain', 'Please provide namespace.');
        NamespaceSteps.getNamespaceValueField().should('have.class', 'ng-invalid');
        const namespaceCount = NamespaceSteps.getDefaultNamespacesLength(DEFAULT_NAMESPACES);
        NamespaceSteps.getNamespacesHeaderPaginationInfo()
            .should('contain', `Showing 1 - 10 of ${namespaceCount} results`);
    });

    it('Should allow to add new namespace', () => {
        const namespacePrefix = 'wine';
        const namespaceUri = 'http://example.com/wine#';

        // Enter correct values
        NamespaceSteps.typeNamespacePrefix(namespacePrefix);
        NamespaceSteps.typeNamespaceURI(namespaceUri);
        NamespaceSteps.addNamespace();

        const updatedCount = NamespaceSteps.getDefaultNamespacesLength(DEFAULT_NAMESPACES) + 1;
        // Verify results table is refreshed
        NamespaceSteps.getRefreshedTableNamespaces();
        NamespaceSteps.getNamespaces().should('have.length', updatedCount);
        NamespaceSteps.getNamespacesHeaderPaginationInfo()
            .should('contain', `Showing 1 - ${updatedCount} of ${updatedCount} results`);
        NamespaceSteps.getNamespace(namespacePrefix)
            .should('be.visible')
            .find('.namespaceURI')
            .should('contain', namespaceUri);
    });

    it('Should not be able to create namespace when there is server error', () => {
        const namespacePrefix = 'wine';
        const namespaceUri = 'http://example.com/wine#';
        const namespaceUriModified = 'http://example.com/wine_example#';

        NamespaceSteps.typeNamespacePrefix(namespacePrefix);
        NamespaceSteps.typeNamespaceURI(namespaceUri);
        NamespaceSteps.addNamespace();

        NamespaceStubs.stubErrorOnNamespaceUpdate(repositoryId);
        // Modify the URI & confirm overwrite
        NamespaceSteps.typeNamespacePrefix(namespacePrefix);
        NamespaceSteps.typeNamespaceURI(namespaceUriModified);
        NamespaceSteps.addNamespace();
        ModalDialogSteps.getDialog().should('be.visible');
        ModalDialogSteps.confirm();

        // Then I expect the dialog to be closed
        ModalDialogSteps.getDialog().should('not.exist');
        // And I expect the error notification to be shown
        ApplicationSteps.getErrorNotifications().should('be.visible')
            .and('contain', 'Internal Server Error');
        // And the prefix and namespace fields should not be cleared to allow user to correct the error
        NamespaceSteps.getNamespacePrefixField().should('have.value', namespacePrefix);
        NamespaceSteps.getNamespaceValueField().should('have.value', namespaceUriModified);
    });

    it('Should allow to overwrite existing namespace', () => {
        const namespacePrefix = 'wine';
        const namespaceUri = 'http://example.com/wine#';
        const namespaceUriModified = 'http://example.com/wine_example#';

        NamespaceSteps.typeNamespacePrefix(namespacePrefix);
        NamespaceSteps.typeNamespaceURI(namespaceUri);
        NamespaceSteps.addNamespace();

        // Modify the URI & confirm overwrite
        NamespaceSteps.typeNamespacePrefix(namespacePrefix);
        NamespaceSteps.typeNamespaceURI(namespaceUriModified);
        NamespaceSteps.addNamespace();
        ModalDialogSteps.getDialog().should('be.visible');
        ModalDialogSteps.confirm();

        // Should have not created new record, should update the existing
        NamespaceSteps.getRefreshedTableNamespaces();
        NamespaceSteps.getNamespaces()
            .should('have.length', NamespaceSteps.getDefaultNamespacesLength(DEFAULT_NAMESPACES) + 1)
            // This assert here ensures the table will contain the modified namespace before actually checking it because the table is
            // re-rendered and any following checks would hit detached DOM elements
            .and('contain', namespaceUriModified);
        NamespaceSteps.getNamespace(namespacePrefix)
            .should('be.visible')
            .find('.namespaceURI')
            .should('contain', namespaceUriModified);
    });

    it('Should not be able to edit namespace when there is server error', () => {
        // Given I have opened the namespaces page
        // When I try to edit a namespace but there is a server error
        NamespaceStubs.stubErrorOnNamespaceUpdate(repositoryId);
        // const prefix = NamespaceSteps.getNamespacePrefix(0);
        // const namespace = NamespaceSteps.getNamespaceValue(0);
        NamespaceSteps.editNamespaceByIndex(0);
        NamespaceSteps.typeInlineNamespacePrefix(0, 'test1');
        NamespaceSteps.typeInlineNamespaceValue(0, 'http://test.com');
        NamespaceSteps.saveInlineNamespace(0);
        // Then I expect the error notification to be shown
        ApplicationSteps.getErrorNotifications().should('be.visible')
            .and('contain', 'Internal Server Error');
        // And the prefix and namespace fields should not be cleared to allow user to correct the error
        NamespaceSteps.getInlineNamespacePrefix(0).should('have.value', 'test1');
        NamespaceSteps.getInlineNamespaceValue(0).should('have.value', 'http://test.com');
    });

    it('Should allow to delete existing namespaces', () => {
        // Delete single namespace from it's actions
        NamespaceSteps.getRefreshedTableNamespaces();
        NamespaceSteps.deleteNamespace('xsd');
        ModalDialogSteps.getDialog().should('be.visible');
        ModalDialogSteps.confirm();
        cy.hideToastContainer();

        NamespaceSteps.getRefreshedTableNamespaces();
        let updatedCount = NamespaceSteps.getDefaultNamespacesLength(DEFAULT_NAMESPACES) - 1;
        // Verify results table is refreshed
        NamespaceSteps.getNamespaces().should('have.length', updatedCount);
        NamespaceSteps.getNamespacesHeaderPaginationInfo()
            .should('contain', `Showing 1 - ${updatedCount} of ${updatedCount} results`);

        NamespaceSteps.selectNamespace('rdf');
        NamespaceSteps.selectNamespace('rdfs');
        NamespaceSteps.getDeleteNamespacesButton().click();
        ModalDialogSteps.getDialog().should('be.visible');
        ModalDialogSteps.confirm();
        cy.hideToastContainer();

        NamespaceSteps.getRefreshedTableNamespaces();
        updatedCount = updatedCount - 2;
        // Verify results table is refreshed
        NamespaceSteps.getNamespaces().should('have.length', updatedCount);
        NamespaceSteps.getNamespacesHeaderPaginationInfo()
            .should('contain', `Showing 1 - ${updatedCount} of ${updatedCount} results`);

        NamespaceSteps.getSelectAllNamespacesCheckbox().click();
        NamespaceSteps.getDeleteNamespacesButton().click();
        ModalDialogSteps.getDialog().should('be.visible');
        ModalDialogSteps.confirm();
        cy.hideToastContainer();

        NamespaceSteps.getNamespacesTable().should('not.be.visible');
        NamespaceSteps.getNoNamespacesAlert().should('be.visible');
    });
});
