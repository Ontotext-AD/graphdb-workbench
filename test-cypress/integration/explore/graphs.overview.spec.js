import {YasrSteps} from "../../steps/yasgui/yasr-steps";
import {GraphsOverviewSteps} from "../../steps/explore/graphs-overview-steps";
import {JsonLdModalSteps} from "../../steps/json-ld-modal-steps";

const EXPORT_GRAPHS_TABLE_ID = '#export-graphs';
const ROWS_PER_PAGE_20 = '1';
const ROWS_PER_PAGE_ALL = '2';

describe('Graphs overview screen validation', () => {

    let repositoryId;

    beforeEach(() => {
        repositoryId = 'repo' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        cy.visit("/");
        cy.window();

        cy.fixture('graph/rdf.txt').then((rdf) => {
            return new Cypress.Promise((resolve, reject) => {
                cy.importRDFTextSnippet(repositoryId, rdf, {format: "application/x-trig"});
                resolve();
            });
        });

        cy.visit('/graphs');
        cy.window();
        // Assume that page is loaded once the table has rendered all expected elements.
        verifyVisibleGraphsCount(10);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    function verifyVisibleGraphsCount(count) {
        cy.get(`${EXPORT_GRAPHS_TABLE_ID} tbody tr`).should('have.length', count);
    }

    //verifies that a certain graph exist within the current page in graphs overview.
    function verifyGraphExistence(graphName, exists = true) {
        cy.get(EXPORT_GRAPHS_TABLE_ID).should(`${!exists ? 'not.' : ''}contain`, graphName);
    }

    /**
     * Assume that pager contains page links and 'First', 'Last' links, this function matches
     * concrete page link.
     * @param page The page to be selected. This could be 'First', 'Last' and any number if present
     * in the pager.
     * @return a cypress chainer containing the selected page link.
     */
    function selectPage(page) {
        return GraphsOverviewSteps.getTopPaginationLinks().contains(page).click();
    }

    function selectItemFromMenu(number) {
        cy.get('[class="btn btn-secondary btn-sm dropdown-toggle"]').click();
        cy.get('[class="dropdown-menu small"] li').eq(number).click();
    }

    function confirmDelete() {
        cy.get('.modal-footer .confirm-btn').click();
        cy.get('.modal').should('not.exist');
    }

    context('Test graphs overview pagination', () => {
        it('Should be visible', () => {
            GraphsOverviewSteps.getPaginations()
                .should('be.visible')
                .and('contain', '3');
            GraphsOverviewSteps.getTopPaginationLinks().should('have.length', 5);
            verifyGraphExistence('The default graph');
        });

        it('Should switch pages', () => {
            // Switch through pages and verify that the respective pager button is active.
            selectPage(2).should('contain', '2')
                .closest('li').should('have.class', 'active');
            verifyGraphExistence('urn:11');

            selectPage(3).should('contain', '3')
                .closest('li').should('have.class', 'active');
            verifyGraphExistence('urn:21');
        });
    });

    it('Test items per page switch menu', () => {
        // Change number of items per page from the menu and verify that proper rows are present in
        // the table.
        selectItemFromMenu(ROWS_PER_PAGE_20);
        verifyGraphExistence('urn:19');

        selectItemFromMenu(ROWS_PER_PAGE_ALL);
        verifyGraphExistence('urn:1');
        verifyGraphExistence('urn:21');
    });

    it('Test graphs overview search', () => {
        // Default items/rows per page is 10.
        verifyVisibleGraphsCount(10);
        // Type graph name in the filter field and verify that proper graphs remain visible in the
        // table.
        cy.get('.search-graphs').type('urn:2');
        verifyVisibleGraphsCount(3);
        verifyGraphExistence('urn:2');
        verifyGraphExistence('urn:11', false);
    });

    it('Delete graph', () => {
        let graphToDelete = 'urn:9';
        cy.get(`${EXPORT_GRAPHS_TABLE_ID} tbody a[title="${graphToDelete}"]`)
            .closest('tr').find('.delete-graph-btn').click();
        confirmDelete();
        verifyGraphExistence(graphToDelete, false);
    });

    it('Clear repository - should delete all graphs', () => {
        cy.get('.clear-repository-btn').click();
        confirmDelete();
        verifyVisibleGraphsCount(1);
        verifyGraphExistence('The default graph');
        // open default graph through the link and verify that the table view is rendered
        cy.contains('The default graph').click();
        cy.url().should('contain', Cypress.config('baseUrl') + '/resource');
        YasrSteps.getResultTableHeader().should('be.visible');
        YasrSteps.getResultTableHeaderColumns().should('have.length', 5);
    });

    it('Should be able to export repository in JSONLD format and restore defaults', () => {
        // Given I select to export the repository as JSON-LD
        GraphsOverviewSteps.selectRow(1);
        GraphsOverviewSteps.exportRepository();
        GraphsOverviewSteps.selectJSONLDOption();

        // Then I select the 'compact' mode option and add context, and export
        GraphsOverviewSteps.selectJSONLDMode(3);
        JsonLdModalSteps.typeJSONLDContext('https://w3c.github.io/json-ld-api/tests/compact/0007-context.jsonld');
        JsonLdModalSteps.clickExportJSONLD();

        // Then the dialog should disappear
        JsonLdModalSteps.getJSONLDModal().should('not.exist');
        // And the file should have downloaded
        JsonLdModalSteps.verifyFileExists('statements.jsonld');

        // When I select the same download as option again and the dialog appears with the prior data
        GraphsOverviewSteps.exportRepository();
        GraphsOverviewSteps.selectJSONLDOption();
        JsonLdModalSteps.getJSONLDModal().should('be.visible');
        JsonLdModalSteps.getSelectedJSONLDModeField().should('have.value', 'http://www.w3.org/ns/json-ld#compacted');
        JsonLdModalSteps.getJSONLDContext().should('have.value', 'https://w3c.github.io/json-ld-api/tests/compact/0007-context.jsonld');

        // Then clicking the 'Restore defaults' button should reset the data in the form
        JsonLdModalSteps.clickRestoreDefaultsJSONLD();
        JsonLdModalSteps.getSelectedJSONLDModeField().should('have.value', 'http://www.w3.org/ns/json-ld#expanded');
    });

    it('Should be able to export repository in JSONLD format with default settings', () => {
        // Given I select to export the repository as JSON-LD
        GraphsOverviewSteps.exportRepository();
        GraphsOverviewSteps.selectJSONLDOption();

        // Then I select the 'flattened' mode option and export
        GraphsOverviewSteps.selectJSONLDMode(2);
        JsonLdModalSteps.clickExportJSONLD();

        // Then the dialog should disappear
        JsonLdModalSteps.getJSONLDModal().should('not.exist');

        // And the file should have downloaded
        JsonLdModalSteps.verifyFileExists('statements.jsonld');
    });

    it('Should be able to export repository in JSONLD format using row download button', () => {
        // Given I select to export the repository as JSON-LD
        GraphsOverviewSteps.downloadAsFromRowButton(0);
        GraphsOverviewSteps.selectJSONLDFromRowDropdown();

        // Then I select the 'expanded' mode option and export
        GraphsOverviewSteps.selectJSONLDMode(1);
        JsonLdModalSteps.clickExportJSONLD();

        // Then the dialog should disappear
        JsonLdModalSteps.getJSONLDModal().should('not.exist');

        // And the file should have downloaded
        JsonLdModalSteps.verifyFileExists('statements.jsonld');
    });
});
