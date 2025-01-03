const LIST_GROUP_ITEM_LABEL = '.list-group-item-heading';
const LIST_GROUP_ITEM_VALUE = '.list-group-item-text';

describe('System information', () => {

    let repositoryId;

    before(() => {
        repositoryId = 'repo' + Date.now();
        cy.createRepository({id: repositoryId});
    });

    beforeEach(() => {
        cy.presetRepository(repositoryId);

        cy.visit('/sysinfo');
        cy.window();
        // Wait for tabs to be rendered
        getTabs().find('.nav-item').should('have.length', 3);
    });

    after(() => {
        cy.deleteRepository(repositoryId);
    });

    context('Initial state tab', () => {
        it('Application info', () => {
            // Application info tab should be selected by default.
            getTabs().find('.application-info-tab').closest('li')
                .should('have.class', 'active');
            // And should have 3 groups
            getTabContent().find('.application-info-body').closest('.tab-pane')
                .should('have.class', 'active')
                .find('.list-group-item').as('groups')
                .should('have.length', 3);

            getGroupItemLabel(0, '.gdb-item').should('be.visible').and('contain', 'GraphDB');
            getGroupItemValue(0, '.gdb-item').should('be.visible');

            getGroupItemLabel(0, '.rdf4j-item').should('be.visible').and('contain', 'RDF4J');
            getGroupItemValue(0, '.rdf4j-item').should('be.visible');

            getGroupItemLabel(0, '.connectors-item').should('be.visible').and('contain', 'Connectors');
            getGroupItemValue(0, '.connectors-item').should('be.visible');

            getGroupItemLabel(1, '.os-item').should('be.visible').and('contain', 'OS');
            getGroupItemValue(1, '.os-item').should('be.visible');

            getGroupItemLabel(1, '.java-item').should('be.visible').and('contain', 'Java');
            getGroupItemValue(1, '.java-item').should('be.visible');

            getGroupItemLabel(1, '.heap-item').should('be.visible').and('contain', 'Heap memory');
            getGroupItemValue(1, '.heap-item').should('be.visible');

            // Server report help should be expandable
            getGroupItem(2, '.server-report-help').should('not.be.visible');
            getGroupItem(2, '.server-report-help-btn').should('be.visible').click();
            getGroupItem(2, '.server-report-help').should('be.visible');
            getGroupItem(2, '.server-report-help-btn').should('be.visible').click();
            getGroupItem(2, '.server-report-help').should('not.be.visible');

            // Report status is visible
            getGroupItem(2, '.report-status').find('.report-none').should('be.visible');

            // New report should be visible and enabled
            getGroupItem(2, '.reports-toobar').find('.new-report-btn').should('be.visible')
                .and('not.be.disabled');
            // Download report should be visible and disabled
            getGroupItem(2, '.reports-toobar').find('.download-report-btn').should('be.visible')
                .and('be.disabled');
        });

        it('JVM Arguments tab', () => {
            // JVM arguments tab can be opened
            selectTab(2);
            // Tab content is visible and there at least 5 jvm arguments listed
            getTabContent().find('.jvm-arguments-body').closest('.tab-pane')
                .should('have.class', 'active')
                .find('.list-group-item').as('groups')
                .should('have.length.of.at.least', 5);
        });

        it('Configuration parameters tab', () => {
            // Configuration parameters tab can be opened
            selectTab(3);
            // Tab content is visible and there at least 5 parameters listed
            getTabContent().find('.configuration-parameters-body').closest('.tab-pane')
                .should('have.class', 'active')
                .find('.list-group-item').as('groups')
                .should('have.length.of.at.least', 5);
        });
    });

    function getTabs() {
        return cy.get('.nav-tabs');
    }

    function getTabContent() {
        return cy.get('.tab-content');
    }

    function selectTab(number) {
        getTabs().find(`li:nth-child(${number}) .nav-item`).click();
    }

    /**
     * Find a group item in a group row in the application info tab
     * @param group A group index (row number)
     * @param itemSelector A concrete item css selector
     * @return The item in the group.
     */
    function getGroupItem(group, itemSelector) {
        return cy.get('@groups').eq(group).find(itemSelector);
    }

    function getGroupItemLabel(group, itemSelector) {
        return getGroupItem(group, itemSelector).find(LIST_GROUP_ITEM_LABEL);
    }

    function getGroupItemValue(group, itemSelector) {
        return getGroupItem(group, itemSelector).find(LIST_GROUP_ITEM_VALUE);
    }
});
