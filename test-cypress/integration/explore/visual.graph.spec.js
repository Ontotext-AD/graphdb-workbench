describe('Visual graph screen validation', () => {

    let repositoryId = 'graphRepo' + Date.now();
    const VALID_RESOURCE = 'USRegion';

    beforeEach(() => {
        repositoryId = 'repo' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.enableAutocomplete(repositoryId);
        cy.importFromUrl(repositoryId, 'https://www.w3.org/TR/owl-guide/wine.rdf', {});
        cy.presetRepositoryCookie(repositoryId);
        cy.visit('/graphs-visualizations');
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Test notification when autocomplete is disabled', () => {
        // Disable it for the test only
        cy.disableAutocomplete(repositoryId);
        getSearchField().type('http://');
        // Verify that a message with a redirection to the autocomplete section is displayed.
        cy.get('.autocomplete-toast a').should('contain', 'Autocomplete is OFF')
            .and('contain', 'Go to Setup -> Autocomplete').click();
        // The link in notification should redirect to the autocomplete page
        cy.url().should('include', '/autocomplete');
    });

    it('Test search for a resource - suggestions', () => {
        getSearchField().type(VALID_RESOURCE);
        // Verify that a list of suggested resources is displayed as you type.
        cy.get('#auto-complete-results-wrapper .result-item').should('have.length', 1);
    });

    it('Test search for an invalid resource', () => {
        getSearchField().type('.invalid_resource');
        // There are two buttons rendered in the DOM where one of them is hidden. We need the visible one.
        cy.get('.autocomplete-visual-btn:visible').click();
        // Verify that an "Invalid URI" message is displayed
        cy.get('#toast-container').should('contain', 'Invalid URI');
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
            getLinksNumberField().should('have.value', '20');
            // Preferred lang: en
            cy.get('.preferred-languages .tag-item').should('have.length', 1)
                .and('contain', 'en');
            // Include inferred: false
            getIncludeInferredStatementsCheckbox().should('not.be.checked')
                .and('not.be.disabled');
            // Expand results over owl:sameAs: false
            getSameAsCheckbox().should('not.be.checked')
                .and('be.disabled');
            // Show predicate labels: true
            getShowPredicateLabelsCheckbox().should('be.checked')
                .and('not.be.disabled');

            // No pre-added preferred/ignored types
            getPreferredTypesField().should('be.empty');
            getShowPreferredTypesOnlyCheckbox().should(('not.be.checked'))
                .and('not.be.disabled');
            getIgnoredTypesField().should('be.empty');

            // Go to predicates tab
            openPredicatesTab();
            // No pre-added preferred/ignored predicates
            getPreferredPredicatesField().should('be.empty');
            getShowPreferredPredicatesOnlyCheckbox().should('not.be.checked')
                .and('not.be.disabled');
            getIgnoredPredicatesField().should('be.empty');

            // Save and rest buttons should be visible and enabled
            cy.get('@sidepanel').scrollIntoView();
            getSaveSettingsButton().and('not.be.disabled');
            getResetSettingsButton().and('not.be.disabled');
        });
    });

    it('Test search for a valid resource with links', () => {
        searchForResource(VALID_RESOURCE);
        // Check include inferred
        enableInferredStatements(true);
        // Navigate to Visual graph menu
        openVisualGraphHome();
        // Search for "USRegion" again
        searchForResource(VALID_RESOURCE);
        // Verify that 20 links (nodes) are displayed
        getPredicates().should('have.length', 20);
        // Verify that links are counted by nodes and not by triples (predicates)
        getNodes().should('have.length', 21);
    });

    it('Test collapse and expand a node', () => {
        searchForResource(VALID_RESOURCE);

        // Hover over node with the mouse and collapse it through the menu
        getTargetNode().trigger('mouseover');
        collapseGraph();

        // Verify that all links to the USRegion node are collapsed
        getPredicates().should('have.length', 0);
        // Verify that the USRegion node is the only node left in the graph
        getNodes().should('have.length', 1).and('contain', 'USRegion');

        // Hover over node with the mouse and expand it through the menu
        getTargetNode().trigger('mouseover');
        expandGraph();

        // Verify that all links to the USRegion node are expanded
        getPredicates().should('have.length', 2);
        // Verify that the USRegion node is not the only node left in the graph
        getNodes().should('have.length', 3);
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
        getNodeInfoPanel().should('not.be.visible');
    });

    it('Test remove child node', () => {
        searchForResource(VALID_RESOURCE);
        // Verify that before given node is removed there are 3 of them
        getNodes().should('have.length', 3);
        // Click once on node different than parent one with the mouse
        cy.get('.node-wrapper circle').eq(1)
        // The wait is needed because mouseover event will result in
        // pop-up of menu icons only if nodes are not moving
            .should('be.visible').wait(5000)
            .trigger('mouseover');
        // Select remove function
        removeNode();
        // Verify that link between parent node and the one child node is expanded
        getPredicates().should('have.length', 1);
        // Verify that the USRegion node is not the only node left in the graph
        getNodes().should('have.length', 2);
    });

    it('Test remove parent node', () => {
        searchForResource(VALID_RESOURCE);

        // Verify that search bar isn't visible
        getSearchField().should('not.be.visible');
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

        getTargetNode().trigger('mouseover');
        collapseGraph();
        // Verify that all links to the USRegion node are collapsed
        getPredicates().should('have.length', 0);
        // Verify that the USRegion node is the only node left in the graph
        getNodes().should('have.length', 1).and('contain', 'USRegion');

        // Double click on collapsed node
        // This is ugly but unfortunately I couldn't make cypress's dblclick to work reliably here
        getTargetNodeElement().click().then(() => {
            getTargetNodeElement().click();
        });

        // Verify that all links to the USRegion node are expanded
        getPredicates().should('have.length', 2);
        // Verify that the USRegion node is not the only node left in the graph
        getNodes().should('have.length', 3);
    });

    it('Test verify mouse/keyboard actions', () => {
        let mouseActions = 'Mouse actions\n                ' +
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
        let touchActions = 'Touch actions\n            \n                \n                \n                    \n                        ' +
            'Tap\n                    \n                    ' +
            'View node details and properties\n                \n                \n                    \n                        ' +
            'Tap and hold\n                    \n                    ' +
            'Removes a node and its links\n                \n                \n                    \n                        ' +
            'Tap twice\n                    \n                    ' +
            'Load node connections\n';
        let keyboardActions = 'Keyboard actions\n                \n                    \n                        \n                            ' +
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
        enableInferredStatements(true);

        // Verify that 20 links (nodes) are displayed
        getPredicates().should('have.length', 20);

        openVisualGraphSettings();
        // Set maximum links to 2
        getLinksNumberField().clear().type('2');
        saveSettings();
        // Verify that the diagram is updated
        getPredicates().should('have.length', 2);

        openVisualGraphSettings();
        // Set maximum links to 100
        getLinksNumberField().clear().type('100');
        saveSettings();
        // Verify that the diagram is updated
        getPredicates().should('have.length', 35);
    });

    it('Test include inferred Statements', () => {
        searchForResource(VALID_RESOURCE);
        // Check include inferred
        enableInferredStatements(true);

        // Verify that many results are displayed
        // Verify that 20 links (nodes) are displayed
        getPredicates().should('have.length', 20);
        // Verify that more than three nodes are displayed
        getNodes().should('have.length', 21);

        // Switch Include Inferred Statements off
        enableInferredStatements();

        // Verify that 20 links (nodes) are displayed
        getPredicates().should('have.length', 2);

        // Verify that three nodes are displayed
        getNodes().should('have.length', 3);

        // Verify that only "Texas" and "California" regions are displayed
        getNodes().should('contain', 'Texas').and('contain', 'California');
    });

    it('Test preferred types', () => {
        typeInSearchField('http://www.w3.org/TR/2003/PR-owl-guide-20031209/wine#Dry');

        openVisualGraphSettings();
        // Set "vin:Chardonnay" as a preferred type
        getPreferredTypesField().clear().type('vin:Chardonnay');
        // Select "Show preferred types only"
        showPreferredTypes(true);

        saveSettings();

        // Verify that there are a total of 6 ( 5 children plus one parent nodes ) are connected to the DRY node
        getNodes().should('have.length', 6).each(($el) => {
            // Exclude parent node
            if ($el.text() !== 'Dry') {
                expect($el.text()).to.contain('Chardonnay');
            }
        });
    });

    it('Test ignored types', () => {
        typeInSearchField('http://www.w3.org/TR/2003/PR-owl-guide-20031209/wine#Dry');

        // Pick a type that is displayed in the diagram for example "vin:Zinfandel"
        getNodes().should('contain', 'Zinfandel');

        openVisualGraphSettings();
        // Go to Settings and set "vin:Zinfandel" as an ignored type
        getIgnoredTypesField().clear().type('vin:Zinfandel');

        // Set the connections limit to 10
        getLinksNumberField().clear().type('10');

        saveSettings();
        // Verify that "vin:Zinfandel" has been removed from the diagram
        getNodes().should('not.contain', 'Zinfandel');
    });

    it('Test preferred predicates', () => {
        typeInSearchField('http://www.w3.org/TR/2003/PR-owl-guide-20031209/wine#Dry');

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
        typeInSearchField('http://www.w3.org/TR/2003/PR-owl-guide-20031209/wine#Dry');

        // Pick a type that is displayed in the diagram for example "vin:Zinfandel"
        getPredicates().should('contain', 'hasSugar');

        openVisualGraphSettings();
        // Go to predicates tab
        openPredicatesTab();
        // Set "vin:hasSugar" as an ignored predicate
        getIgnoredPredicatesField().clear().type('vin:hasSugar');

        // Set the connections limit to 10
        getLinksNumberField().clear().type('10');
        saveSettings();

        // Verify that "vin:hasSugar" has been removed from the diagram
        getPredicates().should('not.contain', 'hasSugar');
    });

    it('Test reset settings', () => {
        typeInSearchField('http://www.w3.org/TR/2003/PR-owl-guide-20031209/wine#Dry');

        // Modify the settings first
        openVisualGraphSettings();
        // Verify that the default settings are as follows:
        // Maximum links to show: 20
        getLinksNumberField().clear().type('10')
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
        getLinksNumberField().should('have.value', '20');
        // Preferred lang: en
        cy.get('.preferred-languages .tag-item').should('have.length', 0);
        // Include inferred: false
        getIncludeInferredStatementsCheckbox().should('not.be.checked')
            .and('not.be.disabled');
        // Expand results over owl:sameAs: false
        getSameAsCheckbox().should('not.be.checked')
            .and('be.disabled');
        // Show predicate labels: true
        getShowPredicateLabelsCheckbox().should('be.checked')
            .and('not.be.disabled');

        // No pre-added preferred/ignored types
        getPreferredTypesField().should('be.empty');
        getShowPreferredTypesOnlyCheckbox().should(('not.be.checked'))
            .and('not.be.disabled');
        getIgnoredTypesField().should('be.empty');

        // Go to predicates tab
        openPredicatesTab();
        // No pre-added preferred/ignored predicates
        getPreferredPredicatesField().should('be.empty');
        getShowPreferredPredicatesOnlyCheckbox().should(('not.be.checked'))
            .and('not.be.disabled');
        getIgnoredPredicatesField().should('be.empty');
    });

    // Visual graph home view access

    function getSearchField() {
        return cy.get('.search-rdf-resources input:visible');
    }

    function typeInSearchField(resource) {
        // Wait should guarantee that the dropdown has been rendered and the focus is properly set.
        getSearchField().type(resource).trigger('change').wait(500).type('{enter}');
    }

    function searchForResource(resource) {
        typeInSearchField(resource);
        // Verify redirection to existing visual graph
        cy.get('.graph-visualization').should('be.visible')
            .find('.nodes-container').should('be.visible');
    }

    function getTargetNodeElement() {
        return cy.get(`[id="http://www.w3.org/TR/2003/PR-owl-guide-20031209/wine#${VALID_RESOURCE}"] circle`);
    }

    function getTargetNode() {
        // The wait is needed because mouseover event will result in
        // pop-up of menu icons only if nodes are not moving
        return getTargetNodeElement().should('be.visible').wait(5000);
    }

    function getNodes() {
        return cy.get('.node-wrapper');
    }

    function getPredicates() {
        return cy.get('.predicate');
    }

    function getNodeInfoPanel() {
        return cy.get('.rdf-info-side-panel .tab-content');
    }

    // Visual graph settings form field access

    function openPredicatesTab() {
        cy.get('.predicates-tab').click();
    }

    function showPreferredTypes(enable) {
        let command = enable ? 'check' : 'uncheck';
        getShowPreferredTypesOnlyCheckbox()[command]();
    }

    function enableInferredStatements(enable) {
        openVisualGraphSettings();
        let command = enable ? 'check' : 'uncheck';
        getIncludeInferredStatementsCheckbox()[command]();
        saveSettings();
    }

    function getLinksNumberField() {
        return cy.get('.input-number');
    }

    function getSaveSettingsButton() {
        return cy.get('.save-settings-btn');
    }

    function saveSettings() {
        getSaveSettingsButton().click();
    }

    function getResetSettingsButton() {
        return cy.get('.reset-settings');
    }

    function resetSettings() {
        getResetSettingsButton().click();
    }

    function getSameAsCheckbox() {
        return cy.get('#sameAsCheck');
    }

    function getIncludeInferredStatementsCheckbox() {
        return cy.get('.include-inferred-statements');
    }

    function getShowPredicateLabelsCheckbox() {
        return cy.get('.show-predicate-labels');
    }

    function getPreferredTypesField() {
        return cy.get('.preferred-types input');
    }

    function getShowPreferredTypesOnlyCheckbox() {
        return cy.get('.show-preferred-types-only');
    }

    function getIgnoredTypesField() {
        return cy.get('.ignored-types input');
    }

    function getPreferredPredicatesField() {
        return cy.get('.preferred-predicates input');
    }

    function getShowPreferredPredicatesOnlyCheckbox() {
        return cy.get('.show-preferred-predicates-only');
    }

    function getIgnoredPredicatesField() {
        return cy.get('.ignored-predicates input');
    }

    // Node actions

    function collapseGraph() {
        cy.get('.menu-events .collapse-icon circle').click();
    }

    function expandGraph() {
        cy.get('.menu-events .expand-icon circle').click();
    }

    function removeNode() {
        cy.get('.menu-events .close-icon circle').click();
    }

    // Visual graph toolbar actions

    function openVisualGraphSettings() {
        return cy.get('.visual-graph-settings-btn').click();
    }

    function openVisualGraphHome() {
        cy.get('.return-home-btn').click();
    }
});
