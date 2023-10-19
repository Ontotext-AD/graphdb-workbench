const FILE_TO_IMPORT = 'wine.rdf';
const DRY_GRAPH = "http://www.w3.org/TR/2003/PR-owl-guide-20031209/wine#Dry";

describe('Visual graph screen validation', () => {

    let repositoryId = 'graphRepo' + Date.now();
    const VALID_RESOURCE = 'USRegion';

    before(() => {
        cy.clearLocalStorage('ls.graphs-viz');
        repositoryId = 'repo' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.importServerFile(repositoryId, FILE_TO_IMPORT);
    });

    after(() => {
        cy.clearLocalStorage('ls.graphs-viz');
        cy.setDefaultUserData();
        cy.deleteRepository(repositoryId);
    });

    beforeEach(() => {
        cy.presetRepository(repositoryId);
    });

    context('When autocomplete is disabled', () => {
        it('Test notification when autocomplete is disabled', () => {
            cy.visit('graphs-visualizations');
            cy.window();
            getSearchField().should('be.visible').type('http://');

            // Verify that a message with a redirection to the autocomplete section is displayed.
            cy.get('.autocomplete-toast a').should('contain', 'Autocomplete is OFF')
                .and('contain', 'Go to Setup -> Autocomplete').click();
            // The link in notification should redirect to the autocomplete page
            cy.url().should('include', '/autocomplete');
        });
    });

    context('When autocomplete is enabled', () => {
        before(() => {
            cy.enableAutocomplete(repositoryId);
        });
        beforeEach(() => {
            cy.visit('graphs-visualizations');
            cy.window();
        });

        it('Test search for an invalid resource', () => {
            getSearchField().should('be.visible').type('.invalid_resource');
            // There are two buttons rendered in the DOM where one of them is hidden. We need the visible one.
            cy.get('.autocomplete-visual-btn:visible').click();
            // Verify that an "Invalid IRI" message is displayed
            cy.get('#toast-container').should('contain', 'Invalid IRI');
        });

        it('Test search for a valid resource', () => {
            searchForResource(VALID_RESOURCE);
            // Verify redirection to existing visual graph
            cy.url().should('match', /USRegion$/);
        });

        it('Test default graph state', () => {
            searchForResource(VALID_RESOURCE);
            openVisualGraphSettings();

            cy.get('.filter-sidepanel').as('sidepanel').should('be.visible').within(() => {
                // Verify that the default settings are as follows:
                // Maximum links to show: 20
                getLinksNumberField().and('have.value', '20');
                // Preferred lang: en
                cy.get('.preferred-languages .tag-item').should('have.length', 1)
                    .and('contain', 'en');
                // Include inferred: false
                getIncludeInferredStatementsCheckbox().and('be.checked')
                    .and('not.be.disabled');
                // Expand results over owl:sameAs: false
                getSameAsCheckbox().and('be.checked')
                    .and('not.be.disabled');
                // Show predicate labels: true
                getShowPredicateLabelsCheckbox().and('be.checked')
                    .and('not.be.disabled');

                // No pre-added preferred/ignored types
                getPreferredTypesField().and('be.empty');
                getShowPreferredTypesOnlyCheckbox().and(('not.be.checked'))
                    .and('not.be.disabled');
                getIgnoredTypesField().should('be.empty');

                // Go to predicates tab
                openPredicatesTab();
                // No pre-added preferred/ignored predicates
                getPreferredPredicatesField().and('be.empty');
                getShowPreferredPredicatesOnlyCheckbox().and('not.be.checked')
                    .and('not.be.disabled');
                getIgnoredPredicatesField().and('be.empty');

                // Save and rest buttons should be visible and enabled
                cy.get('@sidepanel').scrollIntoView();
                getSaveSettingsButton().and('not.be.disabled');
                getResetSettingsButton().and('not.be.disabled');
            });
        });

        it('Test invalid links limit should show error to user ', () => {
            searchForResource(VALID_RESOURCE);
            openVisualGraphSettings();

            cy.get('.filter-sidepanel').as('sidepanel').should('be.visible').within(() => {
                // Verify that the default settings are as follows:
                // Maximum links to show: 20
                getLinksNumberField().and('have.value', '20');
               // Update default 20
                updateLinksLimitField('1001')
                    .then(() => {
                        // Try to put invalid value such as 1001
                        cy.get('.idError')
                            .should('be.visible')
                            .and('contain.text', 'Invalid links limit');
                    });
                // Try to save the invalid value
                getSaveSettingsButton().and('not.be.disabled')
                    .click();
                // Then reset to default settings
                getResetSettingsButton().and('not.be.disabled')
                    .click()
                    .then(() => {
                        getLinksNumberField().and('have.value', '20');
                        cy.get('.idError')
                            .should('not.exist');
                    });
            });
        });

        it('Test search for a valid resource with links', () => {
            searchForResource(VALID_RESOURCE);
            // Check include inferred
            toggleInferredStatements(true);
            // Navigate to Visual graph menu
            openVisualGraphHome();
            // Search for "USRegion" again
            searchForResource(VALID_RESOURCE);
            // Verify that 20 links (nodes) are displayed
            getPredicates().should('have.length', 20);
            // Verify that links are counted by nodes and not by triples (predicates)
            getNodes().and('have.length', 21);
        });

        it('Test collapse and expand a node', () => {
            searchForResource(VALID_RESOURCE);
            toggleInferredStatements(false);

            // Hover over node with the mouse and collapse it through the menu
            getTargetNode().trigger('mouseover');
            collapseGraph();

            // Verify that all links to the USRegion node are collapsed
            getPredicates().should('have.length', 0);
            // Verify that the USRegion node is the only node left in the graph
            getNodes().and('have.length', 1).and('contain', 'USRegion');

            // Hover over node with the mouse and expand it through the menu
            getTargetNode().trigger('mouseover');
            expandGraph();

            // Verify that all links to the USRegion node are expanded
            getPredicates().should('have.length', 3);
            // Verify that the USRegion node is not the only node left in the graph
            getNodes().and('have.length', 4);
        });

        it('Test expand and collapse node info panel with single click', () => {
            searchForResource(VALID_RESOURCE);

            // Click once on the node with the mouse to open node's info panel
            getTargetNode().click();
            // Verify that a side panel is displayed containing info about the resource
            getNodeInfoPanel().should('be.visible')
                .find('.uri')
                .should('be.visible')
                .and('contain', VALID_RESOURCE);

            // Close side panel and verify it's missing
            getTargetNode().click();
            getNodeInfoPanel().should('not.exist');
        });

        it('Test remove child node', () => {
            searchForResource(VALID_RESOURCE);
            toggleInferredStatements(false);
            // Verify that before given node is removed there are 4 of them
            getNodes().and('have.length', 4);
            // Click once on node different than parent one with the mouse
            cy.get('.node-wrapper circle').eq(1)
            // The wait is needed because mouseover event will result in
            // pop-up of menu icons only if nodes are not moving
                .should('be.visible').wait(5000)
                .trigger('mouseover', {force: true});
            // Select remove function
            removeNode();
            // Verify that links between parent node and the child nodes are expanded
            getPredicates().should('have.length', 2);
            // Verify that the nodes left are one less
            getNodes().and('have.length', 3);
        });

        it('Test remove parent node', () => {
            searchForResource(VALID_RESOURCE);

            // Verify that search bar isn't visible
            getSearchField().should('not.exist');
            // Hover over node with the mouse
            getTargetNode().trigger('mouseover');
            // Select remove function for the parent node
            removeNode();
            cy.get('.graph-visualization').should('not.be.visible');
            // Verify that the search bar re-appears on the screen
            cy.get('.incontext-search-rdf-resource input').should('be.visible');
        });

        it('Test expand collapsed node which has connections with double click', () => {
            searchForResource(VALID_RESOURCE);
            toggleInferredStatements(false);

            getTargetNode().trigger('mouseover');
            collapseGraph();
            // Verify that all links to the USRegion node are collapsed
            getPredicates().should('not.exist');
            // Verify that the USRegion node is the only node left in the graph
            getNodes().and('have.length', 1).and('contain', 'USRegion');

            // Double click on collapsed node
            // This is ugly but unfortunately I couldn't make cypress's dblclick to work reliably here
            getTargetNodeElement().dblclick()

            // Verify that all links to the USRegion node are expanded
            getPredicates().should('have.length', 3);
            // Verify that the USRegion node is not the only node left in the graph
            getNodes().and('have.length', 4);
        });

        it('Test verify mouse/keyboard actions', () => {
            const mouseActions = 'Mouse actions\n                ' +
                '\n                    \n                    \n                        \n                            ' +
                'Single click\n                        \n                        ' +
                'View node details and properties\n                    \n                    \n                        \n                            ' +
                'Double click\n                        \n                        ' +
                'Load node connections\n                    \n                    \n                        \n                            ' +
                'Ctrl/Cmd-click\n                        \n                        ' +
                'Removes a node and its links\n                    \n                    \n                        \n                            ' +
                'Ctrl/Cmd-Shift-click\n                        \n                        ' +
                'Restart the view with that node as a central one\n                    \n                    \n                        \n                            ' +
                'Click and drag a node\n                        \n                        ' +
                'Move a node by dragging it (will also pin down the node)\n                    \n                    \n                        \n                            ' +
                'Right click a node\n                        \n                        ' +
                'Pin down or unpin the node\n                    \n                    \n                        \n                            ' +
                'Click and drag outside a node\n                        \n                        ' +
                'Move the whole graph\n';
            const touchActions = 'Touch actions\n            \n                \n                \n                    \n                        ' +
                'Tap\n                    \n                    ' +
                'View node details and properties\n                \n                \n                    \n                        ' +
                'Tap and hold\n                    \n                    ' +
                'Removes a node and its links\n                \n                \n                    \n                        ' +
                'Tap twice\n                    \n                    ' +
                'Load node connections\n';
            const keyboardActions = 'Keyboard actions\n                \n                    \n                        \n                            ' +
                'Left arrow\n                        \n                        ' +
                'Rotate the graph to the left\n                    \n                    \n                        \n                            ' +
                'Right arrow\n                        \n                        ' +
                'Rotate the graph to the right\n';

            // Click on "mouse and keyboard actions" in the lower right corner of the screen
            cy.get('#keyboardShortcuts').click();
            // Verify all mouse and actions
            cy.get('.hotkeys-container').should('contain', mouseActions);
            // Verify all touch actions
            cy.get('.hotkeys-container').then(($el) => {
                expect($el.text()).to.contain(touchActions);
            });
            // // Verify keyboard actions
            cy.get('.hotkeys-container').then(($el) => {
                expect($el.text()).to.contain(keyboardActions);
            });
        });

        it('Test maximum links to show', () => {
            searchForResource(VALID_RESOURCE);

            // Verify that 20 links (nodes) are displayed
            getPredicates().should('have.length', 20);

            openVisualGraphSettings();
            // Set maximum links to 2
            updateLinksLimitField('2');
            saveSettings();
            // Verify that the diagram is updated
            getPredicates().should('have.length', 2);

            openVisualGraphSettings();
            // Set maximum links to 100
            updateLinksLimitField('100');
            saveSettings();
            // Verify that the diagram is updated
            getPredicates().should('have.length', 36);
        });

        it('Test include inferred Statements', () => {
            searchForResource(VALID_RESOURCE);
            // Check include inferred
            toggleInferredStatements(true);

            // Verify that many results are displayed
            // Verify that 20 links (nodes) are displayed
            getPredicates().should('have.length', 20);
            // Verify that more than three nodes are displayed
            getNodes().and('have.length', 21);

            // Switch Include Inferred Statements off
            toggleInferredStatements(false);

            // Verify that 20 links (nodes) are displayed
            getPredicates().should('have.length', 3);

            // Verify that three nodes are displayed
            getNodes().should('have.length', 4);

            // Verify that only "Texas" and "California" regions are displayed
            getNodes().and('contain', 'Texas').and('contain', 'California');
        });

        it('Test preferred types', () => {
            cy.searchEasyVisualGraph(DRY_GRAPH);

            openVisualGraphSettings();
            // Set "vin:Chardonnay" as a preferred type
            getPreferredTypesField().clear().type('vin:Chardonnay');
            // Select "Show preferred types only"
            showPreferredTypes(true);

            saveSettings();

            // Verify that there are a total of 6 ( 5 children plus one parent nodes ) are connected to the DRY node
            getNodes().and('have.length', 6).each(($el) => {
                // Exclude parent node
                if ($el.text() !== 'Dry') {
                    expect($el.text()).to.contain('Chardonnay');
                }
            });
        });

        it('Test ignored types', () => {
            cy.searchEasyVisualGraph(DRY_GRAPH);

            // Pick a type that is displayed in the diagram for example "vin:Zinfandel"
            getNodes().and('contain', 'Zinfandel');

            openVisualGraphSettings();
            // Set the connections limit to 10
            updateLinksLimitField('10');
            // Go to Settings and set "vin:Zinfandel" as an ignored type
            getIgnoredTypesField().clear().type('vin:Zinfandel').type('{enter}');

            saveSettings();
            // Verify that "vin:Zinfandel" has been removed from the diagram
            getNodes().and('not.contain', 'Zinfandel');
        });

        it('Test preferred predicates', () => {
            cy.searchEasyVisualGraph(DRY_GRAPH);

            openVisualGraphSettings();
            // Go to predicates tab
            openPredicatesTab();
            // Set "vin:hasSugar" as a preferred predicate
            getPreferredPredicatesField().clear().type('vin:hasSugar');
            // Select "Show preferred predicates only"
            getShowPreferredPredicatesOnlyCheckbox().check();

            saveSettings();
            // Verify that only the "vin:hasSugar" predicate is displayed between the nodes
            getPredicates().should('contain', 'hasSugar');
        });

        it('Test ignored predicates', () => {
            cy.searchEasyVisualGraph(DRY_GRAPH);
            toggleInferredStatements(false);

            // Pick a type that is displayed in the diagram for example "vin:Zinfandel"
            getPredicates().should('contain', 'hasSugar');

            openVisualGraphSettings();
            // Go to predicates tab
            openPredicatesTab();

            // Set the connections limit to 10
            updateLinksLimitField('10');
            // Set "vin:hasSugar" as an ignored predicate
            getIgnoredPredicatesField().clear().type('vin:hasSugar').type('{enter}');

            saveSettings();

            // Verify that "vin:hasSugar" has been removed from the diagram
            getPredicates().should('not.contain', 'hasSugar');
        });

        it('Test reset settings', () => {
            cy.searchEasyVisualGraph(DRY_GRAPH);

            // Modify the settings first
            openVisualGraphSettings();
            // Verify that the default settings are as follows:
            // Maximum links to show: 20
            updateLinksLimitField('10')
                .should('have.value', '10');
            // Preferred lang: en
            cy.get('.preferred-languages .tag-item').should('have.length', 1)
                .eq(0).should('contain', 'en');
            // Include inferred: false
            getIncludeInferredStatementsCheckbox().check()
                .should('be.checked');
            // Expand results over owl:sameAs: false
            getSameAsCheckbox().check()
                .should('be.checked');
            // Show predicate labels: true
            getShowPredicateLabelsCheckbox().uncheck()
                .should('not.be.checked');

            // No pre-added preferred/ignored types
            getPreferredTypesField().type('vin:PinotNoir')
                .should('have.value', 'vin:PinotNoir');
            getShowPreferredTypesOnlyCheckbox().check()
                .should('be.checked');
            getIgnoredTypesField().type('vin:PinotNoir')
                .should('have.value', 'vin:PinotNoir');

            // Go to predicates tab
            openPredicatesTab();
            // No pre-added preferred/ignored predicates
            getPreferredPredicatesField().type('vin:hasSugar')
                .should('have.value', 'vin:hasSugar');
            getShowPreferredPredicatesOnlyCheckbox().check()
                .should('be.checked');
            getIgnoredPredicatesField().type('vin:hasSugar')
                .should('have.value', 'vin:hasSugar');

            saveSettings();

            // Reset settings and verify everything is reverted to its default
            openVisualGraphSettings();
            resetSettings();
            saveSettings();

            openVisualGraphSettings();
            // Verify that the default settings are as follows:
            // Maximum links to show: 20
            getLinksNumberField().and('have.value', '20');
            // Preferred lang: en
            cy.get('.preferred-languages .tag-item').should('have.length', 1);
            // Include inferred: false
            getIncludeInferredStatementsCheckbox().and('be.checked')
                .and('not.be.disabled');
            // Expand results over owl:sameAs: true
            getSameAsCheckbox().and('be.checked')
                .and('not.be.disabled');
            // Show predicate labels: true
            getShowPredicateLabelsCheckbox().and('be.checked')
                .and('not.be.disabled');

            // No pre-added preferred/ignored types
            getPreferredTypesField().and('be.empty');
            getShowPreferredTypesOnlyCheckbox().and(('not.be.checked'))
                .and('not.be.disabled');
            getIgnoredTypesField().should('be.empty');

            // Go to predicates tab
            openPredicatesTab();
            // No pre-added preferred/ignored predicates
            getPreferredPredicatesField().and('be.empty');
            getShowPreferredPredicatesOnlyCheckbox().and(('not.be.checked'))
                .and('not.be.disabled');
            getIgnoredPredicatesField().and('be.empty');
        });

        it('Test include schema statements', () => {
            cy.searchEasyVisualGraph(DRY_GRAPH);
            getPredicates().should('contain', 'type');
            openVisualGraphSettings();
            getSettingsPanel().should('be.visible');
            cy.get('.include-schema-statements').should('be.checked');
            cy.get('.include-schema-statements').uncheck();
            saveSettings();
            getPredicates().should('not.exist');
        });
    });

    it('Test can create custom visual graph', () => {
        cy.visit('graphs-visualizations');
        getCreateCustomGraphLink().click();
        cy.url().should('include', '/config/save');
        getGraphConfigName().type('configName');

        cy.get('.page-1-link').should('be.visible')
            .and('contain', 'Starting point')
            .and('have.class', 'active');
        cy.get('.page-2-link').should('be.visible')
            .and('contain', 'Graph expansion');
        cy.get('.page-3-link').should('be.visible')
            .and('contain', 'Node basics');
        cy.get('.page-4-link').should('be.visible')
            .and('contain', 'Edge basics');
        cy.get('.page-5-link').should('be.visible')
            .and('contain', 'Node extra');
        cy.get('.page-2-link').click();
        cy.get('.page-2-link').should('have.class', 'active');

        cy.get('.expand-samples .list-group-item').first().click();
        getSaveConfig().click();
        cy.url().should('eq', Cypress.config('baseUrl') + '/graphs-visualizations');
        getGraphConfigurationsArea().should('be.visible')
            .and('contain', 'configName');
        getGraphConfigurationsArea().should('be.visible')
            .and('contain', 'No graph configs');
    });

    // Visual graph home view access

    function getSearchField() {
        return cy.get('.search-rdf-resources input:visible');
    }

    function searchForResource(resource) {
        // verify that the easy graph search has occured and a valid resource was input and only
        // after that execute the next operation
        cy.searchEasyVisualGraph(resource)
            .then(() => {
                // Verify redirection to existing visual graph
                cy.waitUntil(() =>
                    cy.get('.graph-visualization')
                        .find('.nodes-container')
                        .then((nodesContainer) => nodesContainer))
                    .then(() => {
                        getNodes();
                    });
            });
    }

    function getTargetNodeElement() {
        return cy.get(`[id="http://www.w3.org/TR/2003/PR-owl-guide-20031209/wine#${VALID_RESOURCE}"] circle`).should('be.visible');
    }

    function getTargetNode() {
        // The wait is needed because mouseover event will result in
        // pop-up of menu icons only if nodes are not moving
        return getTargetNodeElement().wait(5000);
    }

    function getNodes() {
        return cy.get('.node-wrapper').should('be.visible');
    }

    function getPredicates() {
        return cy.get('.predicate');
    }

    function getNodeInfoPanel() {
        return cy.get('.rdf-info-side-panel .tab-content');
    }

    function getSettingsPanel() {
        return cy.get('.rdf-info-side-panel .filter-sidepanel');
    }

    // Visual graph settings form field access

    function openPredicatesTab() {
        cy.get('.predicates-tab').should('be.visible').click();
    }

    function showPreferredTypes(enable) {
        const command = enable ? 'check' : 'uncheck';
        getShowPreferredTypesOnlyCheckbox()[command]();
    }

    function toggleInferredStatements(enable) {
        openVisualGraphSettings();
        getSettingsPanel().should('be.visible');
        const command = enable ? 'check' : 'uncheck';
        getIncludeInferredStatementsCheckbox()[command]();
        saveSettings();
    }

    function getLinksNumberField() {
        // This element could not be checked with 'be.visible' because it has
        // CSS property: 'position: fixed' and its being covered by another element
        return cy.get('.input-number');
    }

    function getSaveSettingsButton() {
        return cy.get('.save-settings-btn').scrollIntoView().should('be.visible');
    }

    function saveSettings() {
        getSaveSettingsButton().click();
    }

    function getResetSettingsButton() {
        return cy.get('.reset-settings').scrollIntoView().should('be.visible');
    }

    function resetSettings() {
        getResetSettingsButton().click();
    }

    function getSameAsCheckbox() {
        return cy.get('#sameAsCheck').should('be.visible');
    }

    function getIncludeInferredStatementsCheckbox() {
        return cy.get('.include-inferred-statements').should('be.visible');
    }

    function getShowPredicateLabelsCheckbox() {
        return cy.get('.show-predicate-labels').should('be.visible');
    }

    function getPreferredTypesField() {
        return cy.get('.preferred-types input').scrollIntoView().should('be.visible');
    }

    function getShowPreferredTypesOnlyCheckbox() {
        return cy.get('.show-preferred-types-only').should('be.visible');
    }

    function getIgnoredTypesField() {
        // This element could not be checked with 'be.visible' because it has
        // CSS property: 'position: fixed' and its being covered by another element
        return cy.get('.ignored-types input');
    }

    function getPreferredPredicatesField() {
        return cy.get('.preferred-predicates input').should('be.visible');
    }

    function getShowPreferredPredicatesOnlyCheckbox() {
        return cy.get('.show-preferred-predicates-only').should('be.visible');
    }

    function getIgnoredPredicatesField() {
        // This element could not be checked with 'be.visible' because it has
        // CSS property: 'position: fixed' and its being covered by another element
        return cy.get('.ignored-predicates input');
    }

    function getCreateCustomGraphLink() {
        return cy.get('.create-graph-config').should('be.visible');
    }

    function getGraphConfigName() {
        return cy.get('.graph-config-name').should('be.visible');
    }

    function getSaveConfig() {
        return cy.get('.btn-save-config').should('be.visible');
    }

    function getGraphConfigurationsArea() {
        return cy.get('.graph-configurations');
    }


    // Node actions

    function collapseGraph() {
        cy.get('.menu-events .collapse-icon circle').should('be.visible').click();
    }

    function expandGraph() {
        cy.get('.menu-events .expand-icon circle').should('be.visible').click();
    }

    function removeNode() {
        cy.get('.menu-events .close-icon circle').click({force: true});
    }

    // Visual graph toolbar actions

    function openVisualGraphSettings() {
        return cy.get('.toolbar-holder').should('be.visible')
            .find('.visual-graph-settings-btn')
            .should('be.visible').click();
    }

    function openVisualGraphHome() {
        cy.get('.toolbar-holder').should('be.visible')
            .find('.return-home-btn').should('be.visible').click();
    }

    function updateLinksLimitField(value) {
        return getLinksNumberField().invoke('val', value).trigger('change', {force: true});
    }
});
