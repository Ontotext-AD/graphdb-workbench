import {VisualGraphSteps} from "../../../steps/visual-graph-steps";
import {ApplicationSteps} from "../../../steps/application-steps";
import {LicenseStubs} from "../../../stubs/license-stubs";
import {AutocompleteStubs} from "../../../stubs/autocomplete/autocomplete-stubs";

const FILE_TO_IMPORT = 'wine.rdf';
const VALID_RESOURCE = 'USRegion';

describe('Visual graph screen validation', () => {

    let repositoryId;

    beforeEach(() => {
        cy.clearLocalStorage('ls.graphs-viz');
        repositoryId = 'graphRepo-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        cy.importServerFile(repositoryId, FILE_TO_IMPORT);
        LicenseStubs.spyGetLicense();
    });

    afterEach(() => {
        cy.clearLocalStorage('ls.graphs-viz');
        cy.deleteRepository(repositoryId);
    });

    context('When autocomplete is disabled', () => {
        it('Test notification when autocomplete is disabled', () => {
            cy.visit('graphs-visualizations');
            cy.window();
            VisualGraphSteps.getSearchField().should('be.visible').type('http://');

            // Verify that a message with a redirection to the autocomplete section is displayed.
            VisualGraphSteps.getAutocompleteToast().should('contain', 'Autocomplete is OFF')
                .and('contain', 'Go to Setup -> Autocomplete').click();
            // The link in notification should redirect to the autocomplete page
            cy.url().should('include', '/autocomplete');
        });
    });

    context('When autocomplete is enabled', () => {
        beforeEach(() => {
            cy.enableAutocomplete(repositoryId);
            //http://localhost:9000/graphs-visualizations?uri=http:%2F%2Fwww.w3.org%2FTR%2F2003%2FPR-owl-guide-20031209%2Fwine%23USRegion
            cy.window();
        });

        it('Test search for an invalid resource', () => {
            VisualGraphSteps.visit();
            VisualGraphSteps.getSearchField().should('be.visible').type('.invalid_resource');
            // There are two buttons rendered in the DOM where one of them is hidden. We need the visible one.
            cy.get('.autocomplete-visual-btn:visible').click();
            // Verify that an "Invalid IRI" message is displayed
            ApplicationSteps.getErrorNotifications().should('be.visible').and('contain', 'Invalid IRI');
        });

        it('Test search for a valid resource', {
            retries: {
                openMode: 0,
                runMode: 1
            }
        }, () => {
            AutocompleteStubs.spyAutocompleteStatus();
            VisualGraphSteps.visit();
            // Verify autocomplete is ON, because sometimes in CI it is OFF and fails when searching for Resource
            cy.wait('@autocompleteStatus')
                .its('response.body')
                .should('equal', true);
            cy.wait('@get-license')
                .its('response.statusCode')
                .should('equal', 200);
            VisualGraphSteps.verifyPageLoaded();
            VisualGraphSteps.searchForResourceAndOpen(VALID_RESOURCE, VALID_RESOURCE);
            // Verify redirection to existing visual graph
            cy.url().should('match', /USRegion$/);
        });

        it('Test default graph state', () => {
            VisualGraphSteps.openUSRegionUri();
            VisualGraphSteps.openVisualGraphSettings();

            cy.get('.filter-sidepanel').as('sidepanel').should('be.visible').within(() => {
                // Verify that the default settings are as follows:
                // Maximum links to show: 20
                VisualGraphSteps.getLinksNumberField().and('have.value', '20');
                // Preferred lang: en
                cy.get('.preferred-languages .tag-item').should('have.length', 1)
                    .and('contain', 'en');
                // Include inferred: false
                VisualGraphSteps.getIncludeInferredStatementsCheckbox().and('be.checked')
                    .and('not.be.disabled');
                // Expand results over owl:sameAs: false
                VisualGraphSteps.getSameAsCheckbox().and('be.checked')
                    .and('not.be.disabled');
                // Show predicate labels: true
                VisualGraphSteps.getShowPredicateLabelsCheckbox().and('be.checked')
                    .and('not.be.disabled');

                // No pre-added preferred/ignored types
                VisualGraphSteps.getPreferredTypesField().and('be.empty');
                VisualGraphSteps.getShowPreferredTypesOnlyCheckbox().and(('not.be.checked'))
                    .and('not.be.disabled');
                VisualGraphSteps.getIgnoredTypesField().should('be.empty');

                // Go to predicates tab
                VisualGraphSteps.openPredicatesTab();
                // No pre-added preferred/ignored predicates
                VisualGraphSteps.getPreferredPredicatesField().and('be.empty');
                VisualGraphSteps.getShowPreferredPredicatesOnlyCheckbox().and('not.be.checked')
                    .and('not.be.disabled');
                VisualGraphSteps.getIgnoredPredicatesField().and('be.empty');

                // Save and rest buttons should be visible and enabled
                cy.get('@sidepanel').scrollIntoView();
                VisualGraphSteps.getSaveSettingsButton().and('not.be.disabled');
                VisualGraphSteps.getResetSettingsButton().and('not.be.disabled');
            });
        });

        it('Test invalid links limit should show error to user ', () => {
            VisualGraphSteps.openUSRegionUri();
            VisualGraphSteps.openVisualGraphSettings();

            cy.get('.filter-sidepanel').as('sidepanel').should('be.visible').within(() => {
                // Verify that the default settings are as follows:
                // Maximum links to show: 20
                VisualGraphSteps.getLinksNumberField().and('have.value', '20');
               // Update default 20
                VisualGraphSteps.updateLinksLimitField('1001')
                    .then(() => {
                        // Try to put invalid value such as 1001
                        cy.get('.idError')
                            .should('be.visible')
                            .and('contain.text', 'Invalid links limit');
                    });
                // Try to save the invalid value
                VisualGraphSteps.getSaveSettingsButton().and('not.be.disabled')
                    .click();
                // Then reset to default settings
                VisualGraphSteps.getResetSettingsButton().and('not.be.disabled')
                    .click()
                    .then(() => {
                        VisualGraphSteps.getLinksNumberField().and('have.value', '20');
                        cy.get('.idError')
                            .should('not.exist');
                    });
            });
        });

        it('Test search for a valid resource with links', () => {
            VisualGraphSteps.openUSRegionUri();
            // Check include inferred
            VisualGraphSteps.toggleInferredStatements(true);
            // Navigate to Visual graph menu
            VisualGraphSteps.openVisualGraphHome();
            // Search for "USRegion" again
            VisualGraphSteps.searchForResourceAndOpen(VALID_RESOURCE, VALID_RESOURCE);
            // Verify that 20 links (nodes) are displayed
            VisualGraphSteps.getPredicates().should('have.length', 20);
            // Verify that links are counted by nodes and not by triples (predicates)
            VisualGraphSteps.getNodes().and('have.length', 21);
        });

        it('Test collapse and expand a node', () => {
            VisualGraphSteps.openUSRegionUri();
            VisualGraphSteps.toggleInferredStatements(false);

            // Hover over node with the mouse and collapse it through the menu
            VisualGraphSteps.getTargetNode().trigger('mouseover');
            VisualGraphSteps.collapseGraph();

            // Verify that all links to the USRegion node are collapsed
            VisualGraphSteps.getPredicates().should('have.length', 0);
            // Verify that the USRegion node is the only node left in the graph
            VisualGraphSteps.getNodes().and('have.length', 1).and('contain', 'USRegion');

            // Hover over node with the mouse and expand it through the menu
            VisualGraphSteps.getTargetNode().trigger('mouseover');
            VisualGraphSteps.expandGraph();

            // Verify that all links to the USRegion node are expanded
            VisualGraphSteps.getPredicates().should('have.length', 3);
            // Verify that the USRegion node is not the only node left in the graph
            VisualGraphSteps.getNodes().and('have.length', 4);
        });

        it('Test expand and collapse node info panel with single click', () => {
            VisualGraphSteps.openUSRegionUri();

            // Click once on the node with the mouse to open node's info panel
            VisualGraphSteps.getTargetNode().click();
            // Verify that a side panel is displayed containing info about the resource
            VisualGraphSteps.getNodeInfoPanel().should('be.visible')
                .find('.uri')
                .should('be.visible')
                .and('contain', VALID_RESOURCE);

            // Close side panel and verify it's missing
            VisualGraphSteps.getTargetNode().click();
            VisualGraphSteps.getNodeInfoPanel().should('not.exist');
        });

        it('Test remove child node', () => {
            VisualGraphSteps.openUSRegionUri();
            VisualGraphSteps.toggleInferredStatements(false);
            // Verify that before given node is removed there are 4 of them
            VisualGraphSteps.getNodes().and('have.length', 4);
            // Click once on node different than parent one with the mouse
            cy.get('.node-wrapper circle').eq(1)
            // The wait is needed because mouseover event will result in
            // pop-up of menu icons only if nodes are not moving
                .should('be.visible').wait(5000)
                .trigger('mouseover', {force: true});
            // Select remove function
            VisualGraphSteps.removeNode();
            // Verify that links between parent node and the child nodes are expanded
            VisualGraphSteps.getPredicates().should('have.length', 2);
            // Verify that the nodes left are one less
            VisualGraphSteps.getNodes().and('have.length', 3);
        });

        it('Test remove parent node', () => {
            VisualGraphSteps.openUSRegionUri();

            // Verify that search bar isn't visible
            VisualGraphSteps.getSearchField().should('not.exist');
            // Hover over node with the mouse
            VisualGraphSteps.getTargetNode().trigger('mouseover');
            // Select remove function for the parent node
            VisualGraphSteps.removeNode();
            cy.get('.graph-visualization').should('not.be.visible');
            // Verify that the search bar re-appears on the screen
            cy.get('.incontext-search-rdf-resource input').should('be.visible');
        });

        it('Test expand collapsed node which has connections with double click', () => {
            VisualGraphSteps.openUSRegionUri();
            VisualGraphSteps.toggleInferredStatements(false);

            VisualGraphSteps.getTargetNode().trigger('mouseover');
            VisualGraphSteps.collapseGraph();
            // Verify that all links to the USRegion node are collapsed
            VisualGraphSteps.getPredicates().should('not.exist');
            // Verify that the USRegion node is the only node left in the graph
            VisualGraphSteps.getNodes().and('have.length', 1).and('contain', 'USRegion');

            // Double click on collapsed node
            // This is ugly but unfortunately I couldn't make cypress's dblclick to work reliably here
            VisualGraphSteps.getTargetNodeElement().click().then(() => {
                VisualGraphSteps.getTargetNodeElement().click();
            });

            // Verify that all links to the USRegion node are expanded
            VisualGraphSteps.getPredicates().should('have.length', 3);
            // Verify that the USRegion node is not the only node left in the graph
            VisualGraphSteps.getNodes().and('have.length', 4);
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

            VisualGraphSteps.openUSRegionUri();
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
            VisualGraphSteps.openUSRegionUri();

            // Verify that 20 links (nodes) are displayed
            VisualGraphSteps.getPredicates().should('have.length', 20);

            VisualGraphSteps.openVisualGraphSettings();
            // Set maximum links to 2
            VisualGraphSteps.updateLinksLimitField('2');
            VisualGraphSteps.saveSettings();
            // Verify that the diagram is updated
            VisualGraphSteps.getPredicates().should('have.length', 2);

            VisualGraphSteps.openVisualGraphSettings();
            // Set maximum links to 100
            VisualGraphSteps.updateLinksLimitField('100');
            VisualGraphSteps.saveSettings();
            // Verify that the diagram is updated
            VisualGraphSteps.getPredicates().should('have.length', 36);
        });

        it('Test include inferred Statements', () => {
            VisualGraphSteps.openUSRegionUri();
            // Check include inferred
            VisualGraphSteps.toggleInferredStatements(true);

            // Verify that many results are displayed
            // Verify that 20 links (nodes) are displayed
            VisualGraphSteps.getPredicates().should('have.length', 20);
            // Verify that more than three nodes are displayed
            VisualGraphSteps.getNodes().and('have.length', 21);

            // Switch Include Inferred Statements off
            VisualGraphSteps.toggleInferredStatements(false);

            // Verify that 20 links (nodes) are displayed
            VisualGraphSteps.getPredicates().should('have.length', 3);

            // Verify that three nodes are displayed
            VisualGraphSteps.getNodes().should('have.length', 4);

            // Verify that only "Texas" and "California" regions are displayed
            VisualGraphSteps.getNodes().and('contain', 'Texas').and('contain', 'California');
        });

        it('Test preferred types', () => {
            VisualGraphSteps.openDryWineUri();

            VisualGraphSteps.openVisualGraphSettings();
            // Set "vin:Chardonnay" as a preferred type
            VisualGraphSteps.getPreferredTypesField().clear().type('vin:Chardonnay');
            // Select "Show preferred types only"
            VisualGraphSteps.showPreferredTypes(true);

            VisualGraphSteps.saveSettings();

            // Verify that there are a total of 6 ( 5 children plus one parent nodes ) are connected to the DRY node
            VisualGraphSteps.getNodes().and('have.length', 6).each(($el) => {
                // Exclude parent node
                if ($el.text() !== 'Dry') {
                    expect($el.text()).to.contain('Chardonnay');
                }
            });
        });

        it('Test ignored types', () => {
            VisualGraphSteps.openDryWineUri();

            // Pick a type that is displayed in the diagram for example "vin:Zinfandel"
            VisualGraphSteps.getNodes().and('contain', 'Zinfandel');

            VisualGraphSteps.openVisualGraphSettings();
            // Set the connections limit to 10
            VisualGraphSteps.updateLinksLimitField('10');
            // Go to Settings and set "vin:Zinfandel" as an ignored type
            VisualGraphSteps.getIgnoredTypesField().clear().type('vin:Zinfandel').type('{enter}');

            VisualGraphSteps.saveSettings();
            // Verify that "vin:Zinfandel" has been removed from the diagram
            VisualGraphSteps.getNodes().and('not.contain', 'Zinfandel');
        });

        it('Test preferred predicates', () => {
            VisualGraphSteps.openDryWineUri();

            VisualGraphSteps.openVisualGraphSettings();
            // Go to predicates tab
            VisualGraphSteps.openPredicatesTab();
            // Set "vin:hasSugar" as a preferred predicate
            VisualGraphSteps.getPreferredPredicatesField().clear().type('vin:hasSugar');
            // Select "Show preferred predicates only"
            VisualGraphSteps.getShowPreferredPredicatesOnlyCheckbox().check();

            VisualGraphSteps.saveSettings();
            // Verify that only the "vin:hasSugar" predicate is displayed between the nodes
            VisualGraphSteps.getPredicates().should('contain', 'hasSugar');
        });

        it('Test ignored predicates', () => {
            VisualGraphSteps.openDryWineUri();
            VisualGraphSteps.toggleInferredStatements(false);

            // Pick a type that is displayed in the diagram for example "vin:Zinfandel"
            VisualGraphSteps.getPredicates().should('contain', 'hasSugar');

            VisualGraphSteps.openVisualGraphSettings();
            // Go to predicates tab
            VisualGraphSteps.openPredicatesTab();

            // Set the connections limit to 10
            VisualGraphSteps.updateLinksLimitField('10');
            // Set "vin:hasSugar" as an ignored predicate
            VisualGraphSteps.getIgnoredPredicatesField().clear().type('vin:hasSugar').type('{enter}');

            VisualGraphSteps.saveSettings();

            // Verify that "vin:hasSugar" has been removed from the diagram
            VisualGraphSteps.getPredicates().should('not.contain', 'hasSugar');
        });

        it('Test reset settings', () => {
            VisualGraphSteps.openDryWineUri();

            // Modify the settings first
            VisualGraphSteps.openVisualGraphSettings();
            // Verify that the default settings are as follows:
            // Maximum links to show: 20
            VisualGraphSteps.updateLinksLimitField('10')
                .should('have.value', '10');
            // Preferred lang: en
            cy.get('.preferred-languages .tag-item').should('have.length', 1)
                .eq(0).should('contain', 'en');
            // Include inferred: false
            VisualGraphSteps.getIncludeInferredStatementsCheckbox().check()
                .should('be.checked');
            // Expand results over owl:sameAs: false
            VisualGraphSteps.getSameAsCheckbox().check()
                .should('be.checked');
            // Show predicate labels: true
            VisualGraphSteps.getShowPredicateLabelsCheckbox().uncheck()
                .should('not.be.checked');

            // No pre-added preferred/ignored types
            VisualGraphSteps.getPreferredTypesField().type('vin:PinotNoir')
                .should('have.value', 'vin:PinotNoir');
            VisualGraphSteps.getShowPreferredTypesOnlyCheckbox().check()
                .should('be.checked');
            VisualGraphSteps.getIgnoredTypesField().type('vin:PinotNoir')
                .should('have.value', 'vin:PinotNoir');

            // Go to predicates tab
            VisualGraphSteps.openPredicatesTab();
            // No pre-added preferred/ignored predicates
            VisualGraphSteps.getPreferredPredicatesField().type('vin:hasSugar')
                .should('have.value', 'vin:hasSugar');
            VisualGraphSteps.getShowPreferredPredicatesOnlyCheckbox().check()
                .should('be.checked');
            VisualGraphSteps.getIgnoredPredicatesField().type('vin:hasSugar')
                .should('have.value', 'vin:hasSugar');

            VisualGraphSteps.saveSettings();

            // Reset settings and verify everything is reverted to its default
            VisualGraphSteps.openVisualGraphSettings();
            VisualGraphSteps.resetSettings();
            VisualGraphSteps.saveSettings();

            VisualGraphSteps.openVisualGraphSettings();
            // Verify that the default settings are as follows:
            // Maximum links to show: 20
            VisualGraphSteps.getLinksNumberField().and('have.value', '20');
            // Preferred lang: en
            cy.get('.preferred-languages .tag-item').should('have.length', 1);
            // Include inferred: false
            VisualGraphSteps.getIncludeInferredStatementsCheckbox().and('be.checked')
                .and('not.be.disabled');
            // Expand results over owl:sameAs: true
            VisualGraphSteps.getSameAsCheckbox().and('be.checked')
                .and('not.be.disabled');
            // Show predicate labels: true
            VisualGraphSteps.getShowPredicateLabelsCheckbox().and('be.checked')
                .and('not.be.disabled');

            // No pre-added preferred/ignored types
            VisualGraphSteps.getPreferredTypesField().and('be.empty');
            VisualGraphSteps.getShowPreferredTypesOnlyCheckbox().and(('not.be.checked'))
                .and('not.be.disabled');
            VisualGraphSteps.getIgnoredTypesField().should('be.empty');

            // Go to predicates tab
            VisualGraphSteps.openPredicatesTab();
            // No pre-added preferred/ignored predicates
            VisualGraphSteps.getPreferredPredicatesField().and('be.empty');
            VisualGraphSteps.getShowPreferredPredicatesOnlyCheckbox().and(('not.be.checked'))
                .and('not.be.disabled');
            VisualGraphSteps.getIgnoredPredicatesField().and('be.empty');
        });

        it('Test include schema statements', () => {
            VisualGraphSteps.openDryWineUri();
            VisualGraphSteps.getPredicates().should('contain', 'type');
            VisualGraphSteps.openVisualGraphSettings();
            VisualGraphSteps.getSettingsPanel().should('be.visible');
            cy.get('.include-schema-statements').should('be.checked');
            cy.get('.include-schema-statements').uncheck();
            VisualGraphSteps.saveSettings();
            VisualGraphSteps.getPredicates().should('not.exist');
        });
    });
});
