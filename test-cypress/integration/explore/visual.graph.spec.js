describe('Visual graph screen validation', function () {
    let repoId = 'graphRepo' + Date.now();
    let validResource = 'USRegion';

    let searchForResource = function (resource) {
        cy.get('div.ng-scope > :nth-child(1) > .card-block > .ng-isolate-scope > .input-group > .form-control')
            .invoke('val', resource).trigger('change', {force: true}).wait(200)
            .type('{enter}');
    };

    let checkIncludeInferredBoxAndSave = function (check) {
        cy.get('i.icon-settings.icon-2x').click()
            .then(() => {
                if (check) {
                    // Include inferred: false
                    cy.get('div.filter-sidepanel.tab-content.ng-scope > div > div.form-group.mb-2 > div.checkbox' +
                        '> label > input[ng-model="settings[\'includeInferred\']"]')
                        .check();
                } else {
                    // Include inferred: false
                    cy.get('div.filter-sidepanel.tab-content.ng-scope > div > div.form-group.mb-2 > div.checkbox' +
                        '> label > input[ng-model="settings[\'includeInferred\']"]')
                        .uncheck();
                }
                cy.get('button[type="submit"]').click();
            });
    };

    before(function () {
        cy.visit('/repository');
        // Create new one
        cy.createNewRepo(repoId).wait(2000);
        cy.setRepoDefault(repoId).wait(500);
        cy.selectRepo(repoId);

        // Import Wine dataset which will be used in most of the following tests
        cy.navigateToPage('Import', 'RDF');
        cy.openImportURLDialog('https://www.w3.org/TR/owl-guide/wine.rdf');
        cy.clickImportUrlBtn();
        cy.clickImportBtnOnPopUpMenu().wait(2000);
    });

    beforeEach(function () {
        // Go to Visual graph page
        cy.visit('/graphs-visualizations').wait(1000);
    });

    after(function () {
        cy.navigateToPage('Setup', 'Repositories');
        cy.deleteRepo(repoId);
    });

    it('Test autocomplete enable toast message', function () {
        // Search for a resource
        cy.get('div.ng-scope > :nth-child(1) > .card-block > .ng-isolate-scope > .input-group > .form-control').type('http://');
        // Verify that a message with a redirection to the autocomplete section is displayed.
        cy.get('div[class="autocomplete-toast"] > a[href="autocomplete"]')
            .then(($el) => {
                expect($el.text()).to.contain('Autocomplete is OFF');
                expect($el.text()).to.contain('Go to Setup -> Autocomplete');
            });

        // Enable autocomplete
        cy.navigateToPage('Setup', 'Autocomplete');
        cy.get('label[for="toggleIndex"]').click().wait(2000);
    });

    it('Test search for a resource - suggestions', function () {
        // Search for a resource
        cy.get('div.ng-scope > :nth-child(1) > .card-block > .ng-isolate-scope > .input-group > .form-control').type('USRegion')
            .then(() => {
                // Verify that a list of suggested resources is displayed as you type.
                cy.get('#auto-complete-results-wrapper')
                    .its('length')
                    .should('be.gt', '0');
            });
    });

    it('Test search for an invalid resource', function () {
        // Search for an invalid resource
        cy.get('div.ng-scope > :nth-child(1) > .card-block > .ng-isolate-scope > .input-group > .form-control').type('hfsafa')
            .then(() => {
                // Click "Show" button
                cy.get('div.ng-scope > :nth-child(1) > .card-block > .ng-isolate-scope > .input-group > :nth-child(3) > .btn').click()
                    .then(() => {
                        // Verify that an "Invalid URI" message is displayed
                        cy.get('#toast-container')
                            .then(($el) => {
                                expect($el.text()).to.contain('Invalid URI');
                            });
                    });
            });
    });

    it('Test search for a valid resource', function () {
        // Search for an valid resource
        searchForResource(validResource);
        // Verify redirection to existing visual graph
        cy.url()
            .should('contain', validResource);
    });

    it('Test default graph state', function () {
        // Search for an valid resource
        searchForResource(validResource);
        // Verify redirection to existing visual graph
        cy.url()
            .should('contain', validResource);

        cy.get('i.icon-settings.icon-2x').click()
            .then(() => {
                // Verify that the default settings are as follows:
                // Maximum links to show: 20
                cy.get('div.filter-sidepanel.tab-content.ng-scope > div > div.form-group.mb-2 > div.form-inline > input[type="number"]')
                    .should('have.value', '20');
                // Preferred lang: en
                cy.get('.input-group > .ng-valid-max-tags > .host > .tags > .tag-list > li[class="tag-item ng-scope  [object Object]"]' +
                    '> ti-tag-item > ng-include > span.ng-binding.ng-scope')
                    .then(($el) => {
                        expect($el.text()).to.contain('en');
                    });
                // Include inferred: false
                cy.get('div.filter-sidepanel.tab-content.ng-scope > div > div.form-group.mb-2 > div.checkbox' +
                    '> label > input[ng-model="settings[\'includeInferred\']"]')
                    .should('not.be.checked');
                // Expand results over owl:sameAs: false
                cy.get('div.filter-sidepanel.tab-content.ng-scope > div > div.form-group.mb-2 > div.checkbox' +
                    '> label > input[ng-model="settings[\'sameAsState\']"]')
                    .should('not.be.checked');
                // Show predicate labels: true
                cy.get('div.filter-sidepanel.tab-content.ng-scope > div > div.form-group.mb-2 > div.checkbox' +
                    '> label > input[ng-model="settings[\'showLinksText\']"]')
                    .should('be.checked');

                // No pre-added preferred/ignored types
                cy.get('.active > .mt-1 > :nth-child(2) > .ng-isolate-scope > .host > .tags > .ng-pristine')
                    .should('have.value', '');
                cy.get('.active > :nth-child(2) > .checkbox > label > .ng-pristine')
                    .should(('not.be.checked'));
                cy.get('.active > :nth-child(3) > :nth-child(2) > .ng-isolate-scope > .host > .tags > .ng-pristine')
                    .should('have.value', '');

                // Go to predicates tab
                cy.get(':nth-child(2) > .ng-binding > .nav-item > .nav-link').click()
                    .then(() => {
                        // No pre-added preferred/ignored predicates
                        cy.get('.active > .mt-1 > :nth-child(2) > .ng-isolate-scope > .host > .tags > .ng-pristine')
                            .should('have.value', '');
                        cy.get('.active > :nth-child(2) > .checkbox > label > .ng-pristine')
                            .should(('not.be.checked'));
                        cy.get('.active > :nth-child(3) > :nth-child(2) > .ng-isolate-scope > .host > .tags > .ng-pristine')
                            .should('have.value', '');
                    });
            });
    });

    it('Test search for a valid resource with links', function () {
        // Search for "USRegion"
        searchForResource(validResource);
        // Verify redirection to existing visual graph
        cy.url()
            .should('contain', validResource);
        // Check include inferred
        checkIncludeInferredBoxAndSave('check');

        // Navigate to Visual graph menu
        cy.get('i.icon-arrow-up.icon-2x')
            .click()
            .then(() => {
                // Search for "USRegion" again
                searchForResource(validResource);
                // Verify redirection to existing visual graph
                cy.url()
                    .should('contain', validResource);

                // 	Verify that 20 links (nodes) are displayed
                cy.get('g.nodes-container > g.link-wrapper')
                    .should('have.length', '20');
                // Verify that links are counted by nodes and not by triples (predicates)
                cy.get('g.nodes-container > g.node-wrapper')
                    .should('have.length', '21');

                // Uncheck include inferred
                checkIncludeInferredBoxAndSave();
            });
    });

    it('Test collapse and expand a node', function () {
        // Search for an valid resource
        searchForResource(validResource);
        // Verify redirection to existing visual graph
        cy.url({timeout: 5000})
            .should('include', validResource);

        // Hover over node with the mouse
        cy.get('g[id="http://www.w3.org/TR/2003/PR-owl-guide-20031209/wine#' + validResource + '"] > circle', {
            waitForAnimations: true,
            animationDistanceThreshold: 0
        })
            .should('be.visible', {timeout: 5000}).wait(5000)
            .trigger('mouseover').wait(1000)
            .then(() => {
                cy.get('g.nodes-container > g.menu-events > g.collapse-icon > circle')
                    .trigger('click', {force: true});
            });

        // Verify that all links to the USRegion node are collapsed
        cy.get('g.nodes-container > g.link-wrapper')
            .should('have.length', '0');
        // Verify that the USRegion node is the only node left in the graph
        cy.get('g.nodes-container > g.node-wrapper')
            .should('have.length', '1').and('contain', 'USRegion');

        // Hover over node with the mouse
        cy.get('g[id="http://www.w3.org/TR/2003/PR-owl-guide-20031209/wine#' + validResource + '"] > circle', {
            waitForAnimations: true,
            animationDistanceThreshold: 0
        })
            .should('be.visible', {timeout: 5000}).wait(5000)
            .trigger('mouseover').wait(1000)
            .then(() => {
                cy.get('g.nodes-container > g.menu-events > g.expand-icon > circle')
                    .trigger('click', {force: true});
            });

        // Verify that all links to the USRegion node are expanded
        cy.get('g.nodes-container > g.link-wrapper')
            .should('have.length', '2');
        // Verify that the USRegion node is not the only node left in the graph
        cy.get('g.nodes-container > g.node-wrapper')
            .its('length')
            .should('be.gt', '1');
    });

    it('Test node info', function () {
        // Search for an valid resource
        searchForResource(validResource);
        // Verify redirection to existing visual graph
        cy.url()
            .should('contain', validResource);

        // Click once on the node with the mouse to open node's info panel
        cy.get('g[id="http://www.w3.org/TR/2003/PR-owl-guide-20031209/wine#' + validResource + '"] > circle')
            .click({force: true})
            .then(() => {
                cy.get('pageslide > div.rdf-side-panel-content.break-word-alt.p-1.pt-2')
                // Verify that a side panel is displayed containing info about the resource
                    .should('be.visible', {timeout: 5000}).and('contain', validResource);
            });
    });

    it('Test remove child node', function () {
        // Search for an valid resource
        searchForResource(validResource);
        // Verify redirection to existing visual graph
        cy.url({timeout: 5000})
            .should('include', validResource);

        // Verify that before given node is removed there are 3 of them
        cy.get('g.nodes-container > g.node-wrapper').should('have.length', '3');

        // Click once on node different than parent one with the mouse
        cy.get('g.nodes-container > g.node-wrapper > circle', {waitForAnimations: true, animationDistanceThreshold: 0}).eq(1)
        // timeout is needed because mouseover event will result in
        // pop-up of menu icons only if nodes are not moving
            .should('be.visible', {timeout: 5000}).wait(5000)
            .trigger('mouseover').wait(1000)
            .then(() => {
                // Select remove function
                cy.get('g.nodes-container > g.menu-events > g.close-icon > circle')
                    .trigger('click', {force: true})
                    .then(() => {
                        // Verify that link between parent node and the one child node is expanded
                        cy.get('g.nodes-container > g.link-wrapper')
                            .should('have.length', '1');
                        // Verify that the USRegion node is not the only node left in the graph
                        cy.get('g.nodes-container > g.node-wrapper')
                            .its('length')
                            .should('to.be', '2');
                    });
            });
    });

    it('Test remove parent node', function () {
        // Search for an valid resource
        searchForResource(validResource);
        // Verify redirection to existing visual graph
        cy.url({timeout: 5000})
            .should('include', validResource);
        // Verify that search bar isn't visible
        cy.get('div.ng-scope > :nth-child(1) > .card-block > .ng-isolate-scope > .input-group > .form-control')
            .should('not.be.visible');
        // Hover over node with the mouse
        cy.get('g[id="http://www.w3.org/TR/2003/PR-owl-guide-20031209/wine#' + validResource + '"] > circle', {
            waitForAnimations: true,
            animationDistanceThreshold: 0
        })
            .should('be.visible', {timeout: 5000}).wait(5000)
            .trigger('mouseover').wait(1000)
            .then(() => {
                // Select remove function
                cy.get('g.nodes-container > g.menu-events > g.close-icon > circle')
                    .trigger('click', {force: true});
                // Verify that the search bar re-appears on the screen
                cy.get('.col-lg-12 > .card > .card-block > .ng-isolate-scope > .input-group > .form-control')
                    .should('be.visible');
            });
    });

    it('Test expand collapsed node which has connections with double click', function () {
        // Search for an valid resource
        searchForResource(validResource);
        // Verify redirection to existing visual graph
        cy.url({timeout: 5000})
            .should('include', validResource);

        // Hover over the node with the mouse
        cy.get('g[id="http://www.w3.org/TR/2003/PR-owl-guide-20031209/wine#' + validResource + '"] > circle', {
            waitForAnimations: true,
            animationDistanceThreshold: 0
        })
        // timeout is needed because mouseover event will result in
        // pop-up of menu icons only if nodes are not moving
            .should('be.visible', {timeout: 5000}).wait(5000)
            .trigger('mouseover').wait(1000);

        // Select collapse function
        cy.get('g.nodes-container > g.menu-events > g.collapse-icon > circle')
            .trigger('click', {force: true});
        // Verify that all links to the USRegion node are collapsed
        cy.get('g.nodes-container > g.link-wrapper')
            .should('have.length', '0');
        // Verify that the USRegion node is the only node left in the graph
        cy.get('g.nodes-container > g.node-wrapper')
            .should('have.length', '1').and('contain', 'USRegion');

        // Double click on collapsed node
        cy.get('g[id="http://www.w3.org/TR/2003/PR-owl-guide-20031209/wine#' + validResource + '"] > circle')
            .click({force: true})
            .then(() => {
                cy.get('g[id="http://www.w3.org/TR/2003/PR-owl-guide-20031209/wine#' + validResource + '"] > circle')
                    .click({force: true});
            });

        // Verify that all links to the USRegion node are expanded
        cy.get('g.nodes-container > g.link-wrapper')
            .should('have.length', '2');
        // Verify that the USRegion node is not the only node left in the graph
        cy.get('g.nodes-container > g.node-wrapper')
            .its('length')
            .should('be.gt', '1');
    });

    it('Test verify mouse/keyboard actions', function () {
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
        cy.get('#keyboardShortcuts')
            .click()
            .then(() => {
                // Verify all mouse and actions
                cy.get('.hotkeys > :nth-child(2)')
                    .then(($el) => {
                        expect($el.text()).to.contain(mouseActions);
                    });

                // Verify all touch actions
                cy.get('.hotkeys > :nth-child(3)')
                    .then(($el) => {
                        expect($el.text()).to.contain(touchActions);
                    });
                // // Verify keyboard actions
                cy.get('.hotkeys > :nth-child(4)')
                    .then(($el) => {
                        expect($el.text()).to.contain(keyboardActions);
                    });
            });
    });

    it('Test maximum links to show', function () {
        // Search for an valid resource
        searchForResource(validResource);
        // Verify redirection to existing visual graph
        cy.url()
            .should('contain', validResource);

        // Check include inferred
        checkIncludeInferredBoxAndSave('check');

        // Verify that 20 links (nodes) are displayed
        cy.get('g.nodes-container > g.link-wrapper')
            .should('have.length', '20');

        cy.get('i.icon-settings.icon-2x').click()
            .then(() => {
                // Set maximum links to 2
                cy.get('div.filter-sidepanel.tab-content.ng-scope > div > div.form-group.mb-2 > div.form-inline > input[type="number"]')
                    .clear().type('2');
                cy.get('button[type="submit"]').click()
                    .then(() => {
                        // Verify that the diagram is updated
                        cy.get('g.nodes-container > g.link-wrapper')
                            .should('have.length', '2');
                    });
            });

        cy.get('i.icon-settings.icon-2x').click()
            .then(() => {
                // Set maximum links to 100
                cy.get('div.filter-sidepanel.tab-content.ng-scope > div > div.form-group.mb-2 > div.form-inline > input[type="number"]')
                    .clear().type('100');
                cy.get('button[type="submit"]').click().wait(1500)
                    .then(() => {
                        // Verify that the diagram is updated
                        cy.get('g.nodes-container > g.link-wrapper')
                            .its('length')
                            .should('be.gt', '20');
                    });
            });

        // Uncheck include inferred
        checkIncludeInferredBoxAndSave();
    });

    it('Test include inferred Statements', function () {
        // Search for an valid resource
        searchForResource(validResource);
        // Verify redirection to existing visual graph
        cy.url()
            .should('contain', validResource);

        // Check include inferred
        checkIncludeInferredBoxAndSave('check');

        // Verify that many results are displayed
        // Verify that 20 links (nodes) are displayed
        cy.get('g.nodes-container > g.link-wrapper')
            .should('have.length', '20');

        // Verify that more than three nodes are displayed
        cy.get('g.nodes-container > g.node-wrapper')
            .its('length')
            .should('be.gt', '3');

        // Switch Include Inferred Statements off
        checkIncludeInferredBoxAndSave();

        // Verify that 20 links (nodes) are displayed
        cy.get('g.nodes-container > g.link-wrapper')
            .should('have.length', '2');

        // Verify that more than three nodes are displayed
        cy.get('g.nodes-container > g.node-wrapper')
            .should('have.length', '3');

        // Verify that only "Texas" and "California" regions are displayed
        cy.get('g.nodes-container > g.node-wrapper')
            .should('contain', 'Texas').and('contain', 'California');
    });

    it('Test preferred types', function () {
        // Search for "http://www.w3.org/TR/2003/PR-owl-guide-20031209/wine#Dry"
        searchForResource('http://www.w3.org/TR/2003/PR-owl-guide-20031209/wine#Dry');

        cy.get('i.icon-settings.icon-2x').click()
            .then(() => {
                // Set "vin:Chardonnay" as a preferred type
                cy.get('.active > .mt-1 > :nth-child(2) > .ng-isolate-scope > .host > .tags > .ng-pristine')
                    .clear().type('vin:Chardonnay');
                // Select "Show preferred types only"
                cy.get('.active > :nth-child(2) > .checkbox > label > .ng-pristine')
                    .check();
                cy.get('button[type="submit"]').click().wait(1000)
                    .then(() => {
                        // Verify that there are a total of 6 ( 5 children plus one parent nodes ) are connected to the DRY node
                        cy.get('g.nodes-container > g.node-wrapper > foreignObject > div.node-label-body > div')
                            .should('have.length', '6')
                            .each(($el) => {
                                // Exclude parent node
                                if ($el.text() !== 'Dry') {
                                    expect($el.text()).to.contain('Chardonnay');
                                }
                            });
                    });
            });

        // Return previous state of the graph
        cy.get('i.icon-settings.icon-2x').click()
            .then(() => {
                cy.get('.active > .mt-1 > :nth-child(2) > .ng-isolate-scope > .host > .tags > .ng-pristine')
                    .clear();
                cy.get('.active > :nth-child(2) > .checkbox > label > .ng-pristine')
                    .uncheck();
                cy.get('button[type="submit"]').click();
            });
    });

    it('Test ignored types', function () {
        // Search for "http://www.w3.org/TR/2003/PR-owl-guide-20031209/wine#Dry"
        searchForResource('http://www.w3.org/TR/2003/PR-owl-guide-20031209/wine#Dry');

        // Pick a type that is displayed in the diagram for example "vin:Zinfandel"
        cy.get('g.nodes-container > g.node-wrapper > foreignObject > div.node-label-body > div')
            .should('contain', 'Zinfandel');

        cy.get('i.icon-settings.icon-2x').click()
            .then(() => {
                // Go to Settings and set "vin:Zinfandel" as an ignored type
                cy.get('.active > :nth-child(3) > :nth-child(2) > .ng-isolate-scope > .host > .tags > .ng-pristine')
                    .clear().type('vin:Zinfandel').wait(200);

                // Set the connections limit to 10
                cy.get('div.filter-sidepanel.tab-content.ng-scope > div > div.form-group.mb-2 > div.form-inline > input[type="number"]')
                    .clear().type('10');

                cy.get('button[type="submit"]').click().wait(1000)
                    .then(() => {
                        // Verify that "vin:Zinfandel" has been removed from the diagram
                        cy.get('g.nodes-container > g.node-wrapper > foreignObject > div.node-label-body > div')
                            .should('not.contain', 'Zinfandel');
                    });
            });

        // Return previous state of the graph
        cy.get('i.icon-settings.icon-2x').click()
            .then(() => {
                cy.get('.active > :nth-child(3) > :nth-child(2) > .ng-isolate-scope > .host > .tags > .ng-pristine')
                    .clear();

                cy.get('div.filter-sidepanel.tab-content.ng-scope > div > div.form-group.mb-2 > div.form-inline > input[type="number"]')
                    .clear().type('20');

                cy.get('button[type="submit"]').click();
            });
    });

    it('Test preferred predicates', function () {
        // Search for "http://www.w3.org/TR/2003/PR-owl-guide-20031209/wine#Dry"
        searchForResource('http://www.w3.org/TR/2003/PR-owl-guide-20031209/wine#Dry');

        cy.get('i.icon-settings.icon-2x').click()
            .then(() => {
                // Go to predicates tab
                cy.get(':nth-child(2) > .ng-binding > .nav-item > .nav-link').click()
                    .then(() => {
                        // Set "vin:hasSugar" as a preferred predicate
                        cy.get('.active > .mt-1 > :nth-child(2) > .ng-isolate-scope > .host > .tags > .ng-pristine')
                            .clear().type('vin:hasSugar');
                        // Select "Show preferred predicates only"
                        cy.get('.active > :nth-child(2) > .checkbox > label > .ng-pristine')
                            .check();

                        cy.get('button[type="submit"]').click().wait(1000)
                            .then(() => {
                                // Verify that only the "vin:hasSugar" predicate is displayed between the nodes
                                cy.get('g.nodes-container > g.link-wrapper > text.predicate')
                                    .should('contain', 'hasSugar');
                            });
                    });
            });

        // Return previous state of the graph
        cy.get('i.icon-settings.icon-2x').click()
            .then(() => {
                cy.get(':nth-child(2) > .ng-binding > .nav-item > .nav-link').click()
                    .then(() => {
                        cy.get('.active > .mt-1 > :nth-child(2) > .ng-isolate-scope > .host > .tags > .ng-pristine')
                            .clear();
                        cy.get('.active > :nth-child(2) > .checkbox > label > .ng-pristine')
                            .uncheck();

                        cy.get('button[type="submit"]').click();
                    });
            });
    });

    it('Test ignored predicates', function () {
        // Search for "http://www.w3.org/TR/2003/PR-owl-guide-20031209/wine#Dry"
        searchForResource('http://www.w3.org/TR/2003/PR-owl-guide-20031209/wine#Dry');

        // Pick a type that is displayed in the diagram for example "vin:Zinfandel"
        cy.get('g.nodes-container > g.link-wrapper > text.predicate')
            .should('contain', 'hasSugar');

        cy.get('i.icon-settings.icon-2x').click()
            .then(() => {
                // Go to predicates tab
                cy.get(':nth-child(2) > .ng-binding > .nav-item > .nav-link').click()
                    .then(() => {
                        // Set "vin:hasSugar" as an ignored predicate
                        cy.get('.active > :nth-child(3) > :nth-child(2) > .ng-isolate-scope > .host > .tags > .ng-pristine')
                            .clear().type('vin:hasSugar').wait(200);

                        // Set the connections limit to 10
                        cy.get('div.filter-sidepanel.tab-content.ng-scope > div > div.form-group.mb-2 > div.form-inline > input[type="number"]')
                            .clear().type('10');

                        cy.get('button[type="submit"]').click().wait(1000)
                            .then(() => {
                                // Verify that "vin:hasSugar" has been removed from the diagram
                                cy.get('g.nodes-container > g.link-wrapper > text.predicate')
                                    .should('not.contain', 'hasSugar');
                            });
                    });
            });

        // Return previous state of the graph
        cy.get('i.icon-settings.icon-2x').click()
            .then(() => {
                // Go to predicates tab
                cy.get(':nth-child(2) > .ng-binding > .nav-item > .nav-link').click()
                    .then(() => {

                        cy.get('.active > :nth-child(3) > :nth-child(2) > .ng-isolate-scope > .host > .tags > .ng-pristine')
                            .clear();

                        cy.get('div.filter-sidepanel.tab-content.ng-scope > div > div.form-group.mb-2 > div.form-inline > input[type="number"]')
                            .clear().type('20');

                        cy.get('button[type="submit"]').click();
                    });
            });
    });

    it('Test reset settings', function () {
        // Search for "http://www.w3.org/TR/2003/PR-owl-guide-20031209/wine#Dry"
        searchForResource('http://www.w3.org/TR/2003/PR-owl-guide-20031209/wine#Dry');

        cy.get('i.icon-settings.icon-2x').click()
            .then(() => {
                // Verify that the default settings are as follows:
                // Maximum links to show: 20
                cy.get('div.filter-sidepanel.tab-content.ng-scope > div > div.form-group.mb-2 > div.form-inline > input[type="number"]')
                    .should('have.value', '20')
                    // Change the default value to 10
                    .clear().type('10')
                    .should('have.value', '10');
                // Preferred lang: en
                cy.get('.input-group > .ng-valid-max-tags > .host > .tags > .tag-list > li[class="tag-item ng-scope  [object Object]"]' +
                    '> ti-tag-item > ng-include > span.ng-binding.ng-scope')
                    .then(($el) => {
                        expect($el.text()).to.contain('en');
                    });
                // Include inferred: false
                cy.get('div.filter-sidepanel.tab-content.ng-scope > div > div.form-group.mb-2 > div.checkbox' +
                    '> label > input[ng-model="settings[\'includeInferred\']"]')
                    .should('not.be.checked')
                    .check()
                    .should('be.checked');
                // Expand results over owl:sameAs: false
                cy.get('div.filter-sidepanel.tab-content.ng-scope > div > div.form-group.mb-2 > div.checkbox' +
                    '> label > input[ng-model="settings[\'sameAsState\']"]')
                    .should('not.be.checked')
                    .check()
                    .should('be.checked');
                // Show predicate labels: true
                cy.get('div.filter-sidepanel.tab-content.ng-scope > div > div.form-group.mb-2 > div.checkbox' +
                    '> label > input[ng-model="settings[\'showLinksText\']"]')
                    .should('be.checked')
                    .uncheck()
                    .should('not.be.checked');

                // No pre-added preferred/ignored types
                cy.get('.active > .mt-1 > :nth-child(2) > .ng-isolate-scope > .host > .tags > .ng-pristine')
                    .should('have.value', '')
                    .type('vin:PinotNoir')
                    .should('have.value', 'vin:PinotNoir');
                cy.get('.active > :nth-child(2) > .checkbox > label > .ng-pristine')
                    .should(('not.be.checked'))
                    .check()
                    .should('be.checked');
                cy.get('.active > :nth-child(3) > :nth-child(2) > .ng-isolate-scope > .host > .tags > .ng-pristine')
                    .should('have.value', '')
                    .type('vin:PinotNoir')
                    .should('have.value', 'vin:PinotNoir');

                // Go to predicates tab
                cy.get(':nth-child(2) > .ng-binding > .nav-item > .nav-link').click()
                    .then(() => {
                        // No pre-added preferred/ignored predicates
                        cy.get('.active > .mt-1 > :nth-child(2) > .ng-isolate-scope > .host > .tags > .ng-pristine')
                            .should('have.value', '')
                            .type('vin:hasSugar')
                            .should('have.value', 'vin:hasSugar');
                        cy.get('.active > :nth-child(3) > :nth-child(2) > .ng-isolate-scope > .host > .tags > .ng-pristine')
                            .should('have.value', '')
                            .type('vin:hasSugar')
                            .should('have.value', 'vin:hasSugar');
                        cy.get('.active > :nth-child(2) > .checkbox > label > .ng-pristine')
                            .should(('not.be.checked'))
                            .check()
                            .should('be.checked');
                        cy.get('button[type="submit"]').click().wait(1000)
                    });

                cy.get('i.icon-settings.icon-2x').click()
                    .then(() => {
                        cy.get('button[ng-click="resetSettings()"]').click();
                        cy.get('button[type="submit"]').click().wait(1000)
                    });
                cy.get('i.icon-settings.icon-2x').click()
                    .then(() => {
                        // Verify that settings are reverted to default:
                        // Maximum links to show: 20
                        cy.get('div.filter-sidepanel.tab-content.ng-scope > div > div.form-group.mb-2 > div.form-inline > input[type="number"]')
                            .should('have.value', '20');
                        // Preferred lang: en
                        cy.get('.input-group > .ng-isolate-scope > .host > .tags > .ng-pristine')
                            .then(($el) => {
                                expect($el.text()).to.contain('');
                            });
                        // Include inferred: false
                        cy.get('div.filter-sidepanel.tab-content.ng-scope > div > div.form-group.mb-2 > div.checkbox' +
                            '> label > input[ng-model="settings[\'includeInferred\']"]')
                            .should('not.be.checked');
                        // Expand results over owl:sameAs: false
                        cy.get('div.filter-sidepanel.tab-content.ng-scope > div > div.form-group.mb-2 > div.checkbox' +
                            '> label > input[ng-model="settings[\'sameAsState\']"]')
                            .should('not.be.checked');
                        // Show predicate labels: true
                        cy.get('div.filter-sidepanel.tab-content.ng-scope > div > div.form-group.mb-2 > div.checkbox' +
                            '> label > input[ng-model="settings[\'showLinksText\']"]')
                            .should('be.checked');

                        // No pre-added preferred/ignored types
                        cy.get('.active > .mt-1 > :nth-child(2) > .ng-isolate-scope > .host > .tags > .ng-pristine')
                            .should('have.value', '');
                        cy.get('.active > :nth-child(2) > .checkbox > label > .ng-pristine')
                            .should(('not.be.checked'));
                        cy.get('.active > :nth-child(3) > :nth-child(2) > .ng-isolate-scope > .host > .tags > .ng-pristine')
                            .should('have.value', '');

                        // Go to predicates tab
                        cy.get(':nth-child(2) > .ng-binding > .nav-item > .nav-link').click()
                            .then(() => {
                                // No pre-added preferred/ignored predicates
                                cy.get('.active > .mt-1 > :nth-child(2) > .ng-isolate-scope > .host > .tags > .ng-pristine')
                                    .should('have.value', '');
                                cy.get('.active > :nth-child(2) > .checkbox > label > .ng-pristine')
                                    .should(('not.be.checked'));
                                cy.get('.active > :nth-child(3) > :nth-child(2) > .ng-isolate-scope > .host > .tags > .ng-pristine')
                                    .should('have.value', '');
                            });
                    });
            });
    });
});
