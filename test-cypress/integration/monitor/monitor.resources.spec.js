describe('Monitor Resources', () => {

    let repositoryId;

    before(() => {
        repositoryId = 'monitoring-repo' + Date.now();
        cy.createRepository({id: repositoryId});
    });

    beforeEach(() => {
        cy.presetRepository(repositoryId);

        cy.visit('/monitor/resources');

        // Wait for loaders to disappear
        cy.get('.ot-splash').should('not.be.visible');
        cy.get('.ot-loader').should('not.be.visible');

        // Ensure the chart on the default active tab is rendered
        getActiveTabContent().find('svg').should('be.visible');
    });

    after(() => {
        cy.deleteRepository(repositoryId);
    });

    function getTabsPanel() {
        return cy.get('.graphics');
    }

    function getActiveTab() {
        return getTabsPanel().find('.nav-link.active');
    }

    function getTabContent() {
        return cy.get('.tab-content');
    }

    function getActiveTabContent() {
        return getTabContent().find('.tab-pane.active');
    }

    function getMemoryUsageChart() {
        return getTabContent().find('.nv-stackedAreaChart');
    }

    it('Initial state ', () => {
        // Graphics container should be present
        getTabsPanel().should('be.visible');
        // All tabs should be visible
        let tabs = ['Memory', 'Threads', 'CPU', 'Classes'];
        getTabsPanel().find('.nav-item').should('have.length', 4).each(($tab, index) => {
            cy.wrap($tab).should('be.visible').contains(tabs[index]);
        });
        // And "Memory" tab should be opened by default
        getActiveTab().contains('Memory');
        getMemoryUsageChart().should('be.visible');
        getActiveTabContent().find('h2').contains('Heap Memory Usage');
    });
});
