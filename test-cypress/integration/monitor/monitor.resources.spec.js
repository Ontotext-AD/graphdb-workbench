describe('Monitor Resources', () => {

    let repositoryId;

    before(() => {
        repositoryId = 'monitoring-repo' + Date.now();
        cy.createRepository({id: repositoryId});
    });

    beforeEach(() => {
        cy.presetRepository(repositoryId);

        cy.visit('/monitor/resources');
        cy.window();

        // Wait for loaders to disappear
        cy.get('.ot-splash').should('not.be.visible');
        cy.get('.ot-loader').should('not.be.visible');

        // Ensure the chart on the default active tab is rendered
        getActiveTabContent().should('be.visible');
    });

    after(() => {
        cy.deleteRepository(repositoryId);
    });

    function getTabsPanel() {
        return cy.get('.graphics');
    }

    function getTabButtons() {
        return getTabsPanel().find('.nav-item');
    }

    function getActiveTab() {
        return getTabButtons().find('.nav-link.active');
    }

    function getTabContent() {
        return cy.get('.tabs');
    }

    function getActiveTabContent() {
        return getTabContent().find('.tab-pane');
    }

    function getChart(id) {
        return getTabContent().find(`#${id}`);
    }

    function verifyCharts(charts) {
        charts.forEach((chart) => {
            getChart(chart.id).scrollIntoView().find('.chart-header').should('contain', chart.label);
            getChart(chart.id).scrollIntoView().find(`.${chart.type}`).should('be.visible');
        });
    }

    it('Should display monitor tabs ', () => {
        const tabs = ['Resource monitoring', 'Performance', 'Cluster health'];

        // Graphics container should be present
        getTabsPanel().should('be.visible');
        // All tabs should be visible
        getTabButtons().should('have.length', tabs.length).each(($tab, index) => {
            cy.wrap($tab).should('be.visible').contains(tabs[index]);
        });
        // Default tap should be Resource monitoring
        getActiveTab().should('contain', 'Resource monitoring');
    });

    it('Resource monitoring tab should show cpu, file, storage and memory charts', () => {
        const charts = [{
            id: 'CPUUsageGraphic',
            label: 'System CPU Load',
            type: 'nv-lineChart'
        }, {
            id: 'openFileDescriptors',
            label: 'File descriptors',
            type: 'nv-lineChart'
        }, {
            id: 'heapMemoryGraphic',
            label: 'Heap memory usage',
            type: 'nv-lineChart'
        }, {
            id: 'offHeapMemoryGraphic',
            label: 'Off-heap memory usage',
            type: 'nv-lineChart'
        }, {
            id: 'diskStorage',
            label: 'Disk Storage',
            type: 'nv-multiBarHorizontalChart'
        }];
        verifyCharts(charts);
    });

    it('Performance monitoring tab should show charts', () => {
        getTabButtons().eq(1).click();
        const charts = [{
            id: 'activeQueries',
            label: 'Queries',
            type: 'nv-lineChart'
        }, {
            id: 'globalCache',
            label: 'Global cache',
            type: 'nv-lineChart'
        }, {
            id: 'epool',
            label: 'Entity pool',
            type: 'multiChart'
        }, {
            id: 'connections',
            label: 'Transactions and Connections',
            type: 'nv-lineChart'
        }];
        verifyCharts(charts);
    });

    it('Cluster health monitoring tab should show charts', () => {
        getTabButtons().eq(2).click();
        const charts = [{
            id: 'clusterHealth',
            label: 'Cluster health',
            type: 'nv-stackedarea'
        }];
        verifyCharts(charts);
    });
});
