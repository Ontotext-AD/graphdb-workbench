describe('SPARQL screen validation', function () {
    let repoId = 'sparqlRepo' + Date.now();

    let modifiedDefaultQuery = 'prefix spif: <http://spinrdf.org/spif#>\n' +
        'select * {\n' +
        '   ?x spif:for (1 2000)\n' +
        '} limit 1001';

    let defaultQuery = 'select * where { \n' +
        '\t?s ?p ?o .\n' +
        '} limit 100 ';

    let verifyQueryResultLengthOnPage = function (resultLength, pageNumber) {
        cy.get(`#yasr-inner table.resultsTable[id*='DataTables_Table_'] > tbody > tr`)
            .should('have.length', resultLength);
    };

    let verifyNumberOfPages = function (numberOfPages) {
        cy.get('#yasr > ul > li')
            .should('have.length', numberOfPages);
    };

    let convertRdfFormatToDataAccepts = function (data_accepts) {
        switch (data_accepts) {
            case 'JSON':
                return 'application/sparql-results+json';
            case 'JSON-LD':
                return 'application/ld+json';
            case 'XML':
                return 'application/sparql-results+xml';
            case 'CSV':
                return 'text/csv';
            case 'TSV':
                return 'text/tab-separated-values';
            case 'Binary RDF Results':
                return 'application/x-binary-rdf-results-table';
        }
    };

    let selectDownloadAs = function (rdfFormat) {
        cy.get('.saveAsDropDown > .btn').should("be.visible", {timeout: 5000});
        cy.get(".ot-loader-new-content").should("not.be.visible");

        cy.get('.saveAsDropDown > .btn').click({timeout: 5000});
        cy.get('#yasr-inner .dropdown-menu > li:contains(' + rdfFormat + ') a')
            .should("have.attr", 'href').and('include', '#');
        cy.get('#yasr-inner .dropdown-menu > li:contains(' + rdfFormat + ') a')
            .should("have.attr", 'data-accepts').and('include', convertRdfFormatToDataAccepts(rdfFormat));
    };
    Cypress.on('uncaught:exception', (err, runnable) => {
        // returning false here prevents Cypress from
        // failing the test
        return false
    });
    // This handles the thrown exception on time out
    let handleUncaughtException = function () {
        cy.on('uncaught:exception', (err, runnable) => {
            // returning false here prevents Cypress from
            // failing the test
            return false
        });
    };

    let executeSavedQuery = function (queryName) {
        cy.get(".ot-loader-new-content").should("not.be.visible");
        cy.get('a#wb-sparql-toggleSampleQueries').click().wait(200);
        cy.get('.popover-content').should("be.visible")
        cy.get('.popover-content #wb-sparql-queryInSampleQueries li').contains(queryName).should("be.visible");
        cy.get('.popover-content #wb-sparql-queryInSampleQueries li').contains(queryName).click().wait(500);

        cy.get(".ot-loader-new-content").should("not.be.visible");
        cy.get('#wb-sparql-runQuery').click().wait(500);
    };

    let deleteCurrentTab = function () {
        cy.get(".ot-loader-new-content").should("not.be.visible");
        cy.wait(1000);
        cy.get('.active > .nav-link > .btn[title="Delete tab"]').should("be.visible");
        cy.wait(1000);
        cy.get('.active > .nav-link > .btn[title="Delete tab"]').click();
        cy.wait(2000);
        cy.get('.modal-dialog > .modal-content > .modal-footer > .btn-primary').click();
    };

    let verifyRedirectionToCopiedQueryURL = function () {
        cy.get('#clipboardURI').then(($element) => {
            // Copy link to query from popup menu. In order this method to be consistent
            // for both tests URL to current query and URL to saved query should do the replacement
            let linkToQuery = $element.val().replace(/\+/g, '%20');
            // Close popup menu
            cy.get('.modal-footer > .btn.btn-secondary').click().wait(1000);
            // Redirect to another view for example 'http://localhost:8888/import#user'
            cy.navigateToPageS('Import', 'RDF');

            // Verify successful redirection to another view
            cy.url()
                .then(($url) => {
                    expect($url.valueOf()).not.to.be.eq(linkToQuery);
                });

            // And from that view visit the copied link
            cy.visit(linkToQuery);

            // Verify successful redirection to copied URL
            cy.url().should("eq", linkToQuery);

            cy.wait(1000);
            cy.navigateToPageS('Import', 'RDF');
            cy.navigateToPageS('SPARQL');
        });
    };

    before(function () {
        //handleUncaughtException();
        cy.navigateToPageS('Setup', 'Repositories');
        // Create new one
        cy.createNewRepoS(repoId).wait(2000);
        cy.setRepoDefaultS(repoId);
        cy.selectRepoS(repoId);
    });

    beforeEach(function () {
        cy.navigateToPageS('SPARQL');
    });

    after(function () {
        cy.deleteRepoS(repoId);
    });

    it('Test execute default query', function () {
        cy.get('#wb-sparql-runQuery').should("be.visible");
        cy.get(".ot-loader-new-content").should("not.be.visible");
        cy.wait(1000);
        cy.get('#wb-sparql-runQuery').click();
        verifyQueryResultLengthOnPage(70, 0);
    });

    it('Test open a new tab', function () {
        // Verify that there is only one tab opened
        cy.get('#sparql-content > div > div > ul.nav.nav-tabs > li > a').should('have.length', 1);
        // Click add new tab button
        cy.get('#wb-sparql-addNewTab').should("be.visible");
        cy.get('#wb-sparql-addNewTab').click();

        // Verify that as result of clicking addNewTab button we've opened one more tab
        cy.get('#sparql-content > div > div > ul.nav.nav-tabs > li > a').should('have.length', 2);
        // Get last added tab
        cy.get('#sparql-content > div > div > ul.nav.nav-tabs > li > a').last()
            .then(($el) => {
                // Verify that its name is "Unnamed"
                expect($el.text()).to.be.eq('Unnamed');
                // Verify that the default query is inserted automatically
                cy.get('.CodeMirror-code')
                    .then(($element) => {
                        expect($element.text()).to.contain("1select * where { 2    ?s ?p ?o .3} limit 100 4​");
                    });
                // Verify that no results are displayed
                cy.get('#yasr-inner').contains("No results from previous run.\n" +
                    "                Click Run or press Ctrl/Cmd-Enter to execute the current query or update.\n").should('be.visible');
            });
        deleteCurrentTab();

    });

    it('Test modify default query', function () {
        // Run custom query returning 1001 results
        cy.executeCustomQuery(modifiedDefaultQuery);
        // Verify that 1001 results are displayed over 2 pages
        verifyNumberOfPages(2);
        // Verify that the first page contains 1000 results
        verifyQueryResultLengthOnPage(1000, 0);
        // Select second page
        cy.get('#yasr > ul > li')
            .each(($el, index) => {
                if (!$el.hasClass('ng-scope active')) {
                    cy.get(`.navbar-right > :nth-child(${index + 1}) > .ng-binding`).click().wait(1000);
                }
            });
        // Verify that the second page contains 1 result
        verifyQueryResultLengthOnPage(1, 1);
    });

    it('Test filter query results', function () {
        // Import Wine dataset
        cy.navigateToPageS('Import', 'RDF');
        cy.openImportURLDialogS('https://www.w3.org/TR/owl-guide/wine.rdf');
        cy.clickImportUrlBtn();
        cy.clickImportBtnOnPopUpMenu().wait(2000);
        // Navigate back to SPARQL page
        cy.navigateToPageS('SPARQL');
        // Execute default query
        cy.executeCustomQuery(defaultQuery);
        // In the search field below the SPARQL editor enter ""White"
        cy.get('input[type="search"]').type('White').wait(1000);
        // Verify that 6 results containing ""White"" are displayed
        verifyQueryResultLengthOnPage(6, 0);
    });

    it('Test download query results in Supported formats', function () {
        cy.get('#wb-sparql-runQuery').should("be.visible");
        cy.get(".ot-loader-new-content").should("not.be.visible");
        cy.wait(1000);
        cy.get('#wb-sparql-runQuery').click();
        selectDownloadAs('JSON');
        selectDownloadAs('XML');
        selectDownloadAs('CSV');
        selectDownloadAs('TSV');
        selectDownloadAs('Binary RDF Results');
    });

    it('Test switch result format tabs', function () {
        // This here is because our UI is throwing exceptions when
        // switching between result format tabs
        // Run the default query
        cy.get('#wb-sparql-runQuery').should("be.visible");
        cy.get(".ot-loader-new-content").should("not.be.visible");
        cy.wait(1000);
        cy.get('#wb-sparql-runQuery').click();
        // Switch to "Raw Response"
        cy.get(".ot-loader-new-content").should("not.be.visible");
        cy.get('.select_rawResponse', {timeout: 2000}).click();
        // Validate result
        cy.get('.yasr_results > .CodeMirror > .CodeMirror-scroll > .CodeMirror-sizer > ' +
            '[style="position: relative; top: 0px;"] > .CodeMirror-lines > div > .CodeMirror-code > div > pre').should('be.visible');
        // Switch to "Pivot table"
        cy.get('.select_pivot').click();
        // Validate result
        cy.get('.yasr_results > .pivotTable > table.pvtUi').should('be.visible');
        // Switch to "Google chart"
        cy.get('.select_gchart').click();
        // Validate result
        cy.get('.yasr_results > #yasr-inner_gchartWrapper').should('be.visible');

        cy.get('.select_table').click();
    });

    it('Test change views', function () {
        // Switch the editor to "Editor only"
        cy.get('#hideEditor > [btn-radio="\'yasr\'"]').click();
        // Verify that only Editor tab is displayed
        cy.get('#queryEditor').should('be.visible');
        cy.get('#yasr-inner').should('not.be.visible');

        // Switch the editor to "Editor and results"
        cy.get('#hideEditor > [btn-radio="\'none\'"]').click();
        // Verify that both Editor and Results tabs are displayed
        cy.get('#queryEditor').should('be.visible');
        cy.get('#yasr-inner').should('be.visible');

        // Switch the editor to "Results only"
        cy.get('#hideEditor > [btn-radio="\'editor\'"]').click();
        // Verify that only Results tab is displayed
        cy.get('#queryEditor').should('not.be.visible');
        cy.get('#yasr-inner').should('be.visible');

        // Return the editor to "Editor and results"
        cy.get('#hideEditor > [btn-radio="\'none\'"]').click();

        // Change the orientation to vertical
        cy.get('button[class="btn btn-link btn-sm p-0 ml-1"]').click();
        // Verify that all elements are visible and properly displayed.
        // TODO: Still have to find way to verify that elements are properly displayed in vertical way?
        cy.get('#queryEditor').should('be.visible');
        cy.get('#yasr-inner').should('be.visible');


        // Run the default query on vertical mode
        cy.get('#wb-sparql-runQuery').click();
        // Verify that all results are properly scaled/displayed

        // Return the orientation to horizontal
        cy.get('button[class="btn btn-link btn-sm p-0 ml-1"]').click();
    });

    it('Test save invalid Sample Queries', function () {
        // Try to save Sample Queries without specifying query name
        cy.get('#wb-sparql-saveQuery').as('openSaveQueryDialog');

        cy.get('@openSaveQueryDialog').click()
            .then(() => {
                cy.get('#wb-sparql-submit').click();
                // Confirm the error message: “Name should not be empty”
                cy.get('.modal-body > div[ng-show="form.$error.required.length"] > div[ng-hide="query.name"]')
                    .should('be.visible').and('contain', 'Name cannot be empty!');
            });

        // Type query name, remove content add try to save the query
        cy.get('#wb-sparql-sampleName').type('My query');
        cy.get('#wb-sparql-sampleValue').clear();
        // Confirm the error message: “Query should not be empty”
        cy.get('#wb-sparql-submit').click();
        cy.get('.modal-body > div[ng-show="form.$error.required.length"] > div[ng-hide="query.body"]', {timeout: 5000})
            .should('be.visible').and('contain', 'Query cannot be empty!');

        // Close "Create New Saved Query" dialog
        cy.get('[novalidate] > .modal-footer > .btn-secondary')
            .click().wait(500);
        cy.get('#wb-sparql-saveQuery').click();
        // Enter a name that already exists - "Add statements"
        cy.get('#wb-sparql-sampleName').type('Add statements').wait(500);
        // Verify that a toast message notifying about the duplicated name is displayed.
        cy.get('#wb-sparql-submit').click();
        cy.get('.modal-body > div[ng-if="queryExists"] ').should('contain', 'Query with name \'Add statements\' already\n' +
            '            exists!');
    });

    it('Test create, edit and delete saved query', function () {
        let savedQueryName = 'Count query' + Date.now();
        let queryToSave = 'select (count (*) as ?cnt)\n' +
            'where {\n' +
            '    ?s ?p ?o .\n' +
            '}';

        // Type a query different than the default one or the saved ones:
        cy.get('.CodeMirror textarea').should("be.visible");
        cy.get(".ot-loader-new-content").should("not.be.visible");
        cy.wait(100);

        cy.get('.CodeMirror textarea').type('{ctrl}a{backspace}', {force: true}).wait(500);
        cy.get('.CodeMirror textarea').invoke('val', queryToSave).trigger('change', {force: true}).wait(500);

        cy.get('#wb-sparql-saveQuery').click();
        // Enter an unique name
        cy.get('#wb-sparql-sampleName').clear().wait(500);
        cy.get('#wb-sparql-sampleName').type(savedQueryName);


        cy.get('#wb-sparql-submit').click().wait(500);

        // Verify that the query is saved
        cy.get('a#wb-sparql-toggleSampleQueries').click();
        cy.get('.popover-content')
            .should('contain', savedQueryName);

        let modifiedSavedQuery = 'select (count (*) as ?cnt)\n' +
            'where {\n' +
            '    ?s1 ?p1 ?o1 .\n' +
            '}';
        // Click on the saved queries icon
        // Press the pen icon to edit the custom query created earlier
        cy.get('a#wb-sparql-toggleSampleQueries').click();

        cy.get('.popover-content');
        cy.get('.popover-content #wb-sparql-queryInSampleQueries > li:contains("' + savedQueryName + '") span[class="icon-edit"]')
            .should("be.visible");
        cy.get('.popover-content #wb-sparql-queryInSampleQueries > li:contains("' + savedQueryName + '") span[class="icon-edit"]')
            .click({force: true});
        cy.get('#wb-sparql-sampleValue').clear().wait(500);
        cy.get('#wb-sparql-sampleValue').invoke('val', modifiedSavedQuery).trigger('change', {force: true}).wait(500);
        cy.get('#wb-sparql-submit').click().wait(200);

        // Verify that the query is edited.
        // Select the query from the saved queries again
        cy.get('a#wb-sparql-toggleSampleQueries').click();
        cy.get('.popover-content');
        cy.get('#wb-sparql-queryInSampleQueries > li:contains("' + savedQueryName + '") span[class="icon-edit"]')
            .should("be.visible");
        cy.get('#wb-sparql-queryInSampleQueries > li:contains("' + savedQueryName + '") span[class="icon-edit"]')
            .click({force: true});

        cy.get('#wb-sparql-sampleValue', {timeout: 3000});
        cy.wait(2000); //todo: we need this as the value of the saved query is loaded dynamically, and first some old text is loaded
        cy.get('#wb-sparql-sampleValue', {timeout: 3000})
            .then(($element) => {
                // Verify that the new query is inserted in the SPARQL editor.
                expect($element.val()).to.be.eq(modifiedSavedQuery);
            });

        // Close edit saved query dialog
        cy.get('#wb-sparql-submit').click().wait(200);

        // Click on the saved queries icon
        cy.get('a#wb-sparql-toggleSampleQueries').click();
        cy.get('.popover-content');
        // Press the trash bin to delete the custom query created earlier
        cy.get('#wb-sparql-queryInSampleQueries > li:contains("' + savedQueryName + '") span[class="icon-trash"]')
            .click({force: true});
        cy.get('.modal-dialog > .modal-content > .modal-footer > .btn-primary').click().wait(1000);


        // Verify that the query is deleted
        cy.get('a#wb-sparql-toggleSampleQueries').click();
        cy.get('.popover-content')
            .should('not.contain', savedQueryName);

    });

    it('Test run saved queries', function () {
        // Execute all default saved queries
        // Verify that they impact the results as expected:

        // Execute the default sample Add Statements
        // Click on the Run button
        executeSavedQuery("Add statements");
        // Verify query information: “Added 2 statements”
        cy.verifyUpdateMessage('Added 2 statements.');
        deleteCurrentTab();

        // Execute the default sample Remove statements
        executeSavedQuery("Remove statements");
        // Verify query information: “Removed 2 statements.”
        cy.verifyUpdateMessage('Removed 2 statements.');
        deleteCurrentTab();

        // Execute the default sample Clear Graph
        executeSavedQuery("Clear graph");
        // Verify query information: “The number of statements did not change.”
        cy.verifyUpdateMessage('The number of statements did not change.');
        deleteCurrentTab();

        // Execute the default SPARQL Select template
        executeSavedQuery("SPARQL Select template");
        // Verify query information: "Showing results from 1 to"
        cy.verifyQueryResultsS();

        deleteCurrentTab();
    });

    it('Test saved query link', function () {
        let addStmts = 'Add statements';
        // Click on the saved queries icon
        cy.get('a#wb-sparql-toggleSampleQueries').click();
        cy.get('.popover-content');

        cy.get('#wb-sparql-queryInSampleQueries > li')
            .each(($el, index) => { //todo: to be fixed
                if ($el.text().trim() === addStmts) {
                    // Press the link icon to generate a link for a query
                    cy.get('#wb-sparql-queryInSampleQueries > li span[class="icon-link"]')
                        .eq(index).click();
                    verifyRedirectionToCopiedQueryURL();
                }
            });
        deleteCurrentTab();
    });

    it('Test URL to current query', function () {
        // Press the link icon to generate a link for a query
        cy.get('#wb-sparql-copyToClipboardQuery').should("be.visible");
        cy.get('#wb-sparql-copyToClipboardQuery').click().wait(1000);
        verifyRedirectionToCopiedQueryURL();
    });

    it('Test rename a tab', function () {
        let firstTabName = 'Select query';
        let secondTabName = 'Update query';

        cy.get(".ot-loader-new-content").should("not.be.visible").wait(500);

        // Rename the initial tab.
        cy.get('#sparql-content > div > div > ul.nav.nav-tabs > li[role="presentation"] > a[role="tab"]', {timeout: 1000})
            .should("be.visible");
        cy.get('#sparql-content > div > div > ul.nav.nav-tabs > li[role="presentation"] > a[role="tab"]', {timeout: 1000})
            .last().dblclick().wait(700);

        cy.get('.editable-controls.form-group > input', {timeout: 1000}).type(firstTabName);
        cy.get('span.editable-buttons > [type="submit"]', {timeout: 1000}).click({timeout: 1000}).wait(300);

        // Verify that the name persists
        cy.get('#sparql-content > div > div > ul.nav.nav-tabs > li > a').contains(firstTabName);

        // Go to a different workbench section
        cy.navigateToPageS('Import', 'RDF');

        // Return to SPARQL
        cy.navigateToPageS('SPARQL');
        cy.get(".ot-loader-new-content").should("not.be.visible");
        cy.wait(1000);
        // Verify that the tab name persists
        cy.get('#sparql-content > div > div > ul.nav.nav-tabs > li > a').contains(firstTabName);

        // Open a new tab
        cy.get('#wb-sparql-addNewTab').click().wait(300);

        // Verify that as result of clicking addNewTab button we've opened one more tab
        cy.get('#sparql-content > div > div > ul.nav.nav-tabs > li > a')
            .should('have.length', 2);
        // Get last added tab
        cy.get('#sparql-content > div > div > ul.nav.nav-tabs > li > a')
            .last()
            .then(($el) => { //todo: fix this
                // Verify that its name is "Unnamed"
                expect($el.text()).to.be.eq('Unnamed');
            });

        // Verify that the first tab's name persists
        cy.get('#sparql-content > div > div > ul.nav.nav-tabs > li > a').contains(firstTabName);
        cy.get(".ot-loader-new-content").should("not.be.visible");

        // Rename the second tab
        cy.get('#sparql-content > div > div > ul.nav.nav-tabs > li[role="presentation"] > a[role="tab"]', {timeout: 1000})
            .last()
            .dblclick().wait(500);

        cy.get('.editable-controls.form-group > input', {timeout: 1000}).type(secondTabName);
        cy.get('span.editable-buttons > [type="submit"]').click();

        // Go to a different workbench section
        cy.navigateToPageS('Import', 'RDF');

        // Return to SPARQL
        cy.navigateToPageS('SPARQL');

        // Verify that the tabs names persist
        cy.get('#sparql-content > div > div > ul.nav.nav-tabs > li > a').contains(firstTabName);
        cy.get('#sparql-content > div > div > ul.nav.nav-tabs > li > a').contains(secondTabName);

        deleteCurrentTab();
    });

    it('Test delete a tab', function () {
        // Verify that there is only one tab opened
        cy.get('#sparql-content > div > div > ul.nav.nav-tabs > li > a').should('have.length', 1);
        // Add a new tab
        cy.get('#wb-sparql-addNewTab').click();
        // Verify that as result of clicking addNewTab button we've opened one more tab
        cy.get('#sparql-content > div > div > ul.nav.nav-tabs > li > a').should('have.length', 2);
        // Delete the second tab
        deleteCurrentTab();
        // Verify that there is only one tab left opened
        cy.get('#sparql-content > div > div > ul.nav.nav-tabs > li > a').should('have.length', 1);
    });

    it('Test close all tabs except the selected one', function () {
        for (let index = 1; index <= 2; index++) {
            // Open a two more tabs
            cy.get('#wb-sparql-addNewTab').click();
            // Change the query in each one of them
            cy.get('.CodeMirror textarea').type('{ctrl}a{backspace}', {force: true});
            cy.get('.CodeMirror textarea').invoke('val', 'select * where { \n' +
                '\t?s' + index + ' ?p' + index + ' ?o' + index + ' .\n' +
                '} limit 100 ').trigger('change', {force: true});
        }

        // Verify that number of opened tabs are 3
        cy.get('#sparql-content > div > div > ul.nav.nav-tabs > li > a').should('have.length', 3);

        // Click on the middle tab close button while holding down the SHIFT key.
        cy.get('.CodeMirror textarea').type('{shift}', {force: true, release: false});
        cy.get(':nth-child(2) > .nav-link > .btn > .icon-close').click();

        // Verify that a dialog box is displayed, notifying that you are about to close all tabs except the one selected.
        cy.get('.modal-dialog > .modal-content > .modal-body.ng-scope')
            .then(($el) => {
                expect($el.text()).to.be.eq('\n    Are you sure you want to delete all query tabs except selected tab?\n');
            });
        cy.get('.modal-dialog > .modal-content > .modal-footer > .btn-primary').click().wait(1000);

        // Confirm and verify that all other tabs have been closed and only the selected one is left in the editor.
        cy.get('#sparql-content > div > div > ul.nav.nav-tabs > li > a').should('have.length', 1);
    });

    it('Test execute queries with prefixes', function () {

        let queryToExecute = 'PREFIX wordn-sc: <http://example.org>\n' +
            'select * where {\n' +
            '?sub rdfs:subClassOf ?c .\n' +
            '?c a owl:Restriction;\n' +
            'owl:onProperty wordn-sc:word;\n' +
            'owl:someValuesFrom wordn-sc:Word .\n' +
            '}';

        // Type a new query
        cy.get('.CodeMirror textarea').type('{ctrl}a{backspace}', {force: true});
        cy.get('.CodeMirror textarea').type(queryToExecute, {force: true});

        // Confirm that prefixes rdfs, owl and wordn-sc have been added automatically
        cy.get('.CodeMirror-code')
            .then(($el) => {
                expect($el.text()).to.contain('2PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>' +
                    '3PREFIX owl: <http://www.w3.org/2002/07/owl#>');
            });

        // Click on the Run button
        cy.get('div#runButton > #wb-sparql-runQuery').as('runQuery');

        cy.get('@runQuery').click();
    });

    it('Test execute (Describe) query', function () {
        let queryToExecute = 'DESCRIBE <http://www.ontotext.com/SYSINFO> FROM <http://www.ontotext.com/SYSINFO>';

        // Type a DESCRIBE query
        cy.executeCustomQuery(queryToExecute).as('executeQuery');

        // Verify query results (Showing n ...)
        cy.verifyQueryResultsS();


        // Confirm that all tabs Raw Response, Pivot Table, Google chart are enabled
        cy.get('.select_rawResponse').should('be.visible').and('not.be.disabled');
        cy.get('.select_pivot').should('be.visible').and('not.be.disabled');
        cy.get('.select_gchart').should('be.visible').and('not.be.disabled');

        // Click on Download As
        // Confirm the available file formats (all supported file formats are available
        cy.get('.saveAsDropDown > .btn').should("be.visible");
        cy.get('.saveAsDropDown > .btn').click();

        cy.get('#yasr-inner .dropdown-menu > li')
            .then(($el) => { //todo: fix this
                // Number of supported formats is 10
                expect($el.length).to.be.eq(10);
            });


        // Select a file format
        // Confirm that query results has been downloaded
        selectDownloadAs('JSON-LD');
    });

    it('Test execute (ASK) query', function () {

        let queryToExecute = 'ASK WHERE { ?s ?p ?o .FILTER (regex(?o, \"ontotext.com\")) }';

        // Type a ASK query
        cy.executeCustomQuery(queryToExecute).as('executeQuery');

        // Confirm that all tabs (Table, Pivot Table, Google chart) are disabled
        cy.get('.select_table').should('not.be.visible');
        cy.get('.select_rawResponse').should('not.be.visible');
        cy.get('.select_pivot').should('not.be.visible');
        cy.get('.select_gchart').should('not.be.visible');

    });

    it('Test execute (CONSTRUCT) query', function () {

        let queryToExecute = 'PREFIX cat: <[http://dbpedia.org/resource/Category:]>\n' +
            'PREFIX foaf: <[http://xmlns.com/foaf/0.1/]>\n' +
            'PREFIX gp: <[http://wifo5-04.informatik.uni-mannheim.de/gutendata/resource/people/]>\n' +
            'PREFIX owl: <[http://www.w3.org/2002/07/owl#]>\n' +
            'PREFIX rdf: <[http://www.w3.org/1999/02/22-rdf-syntax-ns#]>\n' +
            'PREFIX rdfs: <[http://www.w3.org/2000/01/rdf-schema#]>\n' +
            'PREFIX skos: <[http://www.w3.org/2004/02/skos/core#]>\n' +
            'CONSTRUCT\n' +
            '{\n' +
            '    <http://dbpedia.org/resource/Joseph_Hocking> ?dbpProperty ?dbpValue .\n' +
            '    gp:Hocking_Joseph ?gutenProperty ?gutenValue .\n' +
            '}\n' +
            'WHERE\n' +
            '{\n' +
            '    SERVICE <http://factforge.net/repositories/ff-news>\n' +
            '    {\n' +
            '        <http://dbpedia.org/resource/Joseph_Hocking> ?dbpProperty ?dbpValue .\n' +
            '    }\n' +
            '}';

        // Type a CONSTRUCT query
        cy.executeCustomQuery(queryToExecute).as('executeQuery');

        // Verify query results (Showing n ...)
        cy.verifyQueryResultsS();

        // Confirm that all tabs (Table, Pivot Table, Google chart) are disabled
        cy.get('.select_table').should('be.visible');
        cy.get('.select_rawResponse').should('be.visible');
        cy.get('.select_pivot').should('be.visible');
        cy.get('.select_gchart').should('be.visible');

        // Select a file format
        // Confirm that query results has been downloaded
        cy.get('.select_rawResponse').as('select_rawResponse');

        cy.get('@select_rawResponse').click();

        cy.get('.yasr_downloadIcon').should('be.visible');

    });

    it('Test execute query with and without "Including inferred" selected', function () {
        let testRepo = 'test-repo' + Date.now();
        // First navigate to create repository
        cy.navigateToPageS('Setup', 'Repositories');
        // // Create new repository
        cy.createNewRepoS(testRepo).wait(1000);
        cy.setRepoDefaultS(testRepo);
        cy.selectRepoS(testRepo).wait(1000);

        cy.navigateToPageS('SPARQL');

        let queryToExecute = 'INSERT DATA { <urn:a> <http://a/b> <urn:b> . <urn:b> <http://a/b> <urn:c> . }';

        // Type a query with inference
        cy.executeCustomQuery(queryToExecute);
        // Execute default query with ‘Include inferred’ which is selected by default
        cy.executeCustomQuery(defaultQuery);

        // Confirm that all statements are available (70 from ruleset, 2 explicit and 2 inferred)
        cy.verifyQueryResultsS(74);

        // Uncheck ‘Include inferred’ using the same query
        cy.get('#inference').as('uncheckIncludeInferred');

        cy.get('@uncheckIncludeInferred').click();

        // Click on the Run button
        cy.get('div#runButton > #wb-sparql-runQuery').as('rerunQuery');


        cy.get('@rerunQuery').click();

        // Confirm that only inferred statements (only 2) are available
        cy.verifyQueryResultsS(2);

        cy.get('@uncheckIncludeInferred').click();
        // Should delete the created repository
        cy.deleteRepoS(testRepo).wait(1000);
    });

    it('Test execute query including inferred with ruleset "OWL-Horst (Optimized)"', function () {
        let testRepo = 'test-repo' + Date.now();
        // First navigate to create repository for this test
        cy.navigateToPageS('Setup', 'Repositories');
        // Create new repository
        cy.createNewRepoS(testRepo, 'OWL-Horst (Optimized)').wait(1000);
        cy.setRepoDefaultS(testRepo);
        // Select the newly created repository
        cy.selectRepoS(testRepo).wait(1000);

        // Upload the wines ontology
        cy.navigateToPageS('Import', 'RDF');
        cy.openImportURLDialogS('https://www.w3.org/TR/owl-guide/wine.rdf');
        cy.clickImportUrlBtn();
        cy.clickImportBtnOnPopUpMenu().wait(1000);

        let defaultQueryWithoutLimit = 'select * where { \n' +
            '\t?s ?p ?o .\n' +
            '}';

        // Navigate back to SPARQL page
        cy.navigateToPageS('SPARQL')

        // Go to SPARQL and execute a SELECT query without a limit
        cy.executeCustomQuery(defaultQueryWithoutLimit);

        // Verify that there are 7,065 results
        cy.verifyQueryResultsS('1,000 of 7,065');

        // Disable the inference from the ">>" icon on the right of the SPARQL editor.
        cy.get('#inference').as('disableInference');

        cy.get('@disableInference').click();

        // Execute the same query again
        cy.get('div#runButton > #wb-sparql-runQuery').as('rerunQuery');

        cy.get('@rerunQuery').click();
        // Verify that there are 1,839 results
        cy.verifyQueryResultsS('1,000 of 1,839');

        cy.get('@disableInference').click();
        // Should delete the created repository
        cy.deleteRepoS(testRepo).wait(1000);
    });

    it('Test execute query including inferred with ruleset "OWL-Horst (Optimized)" enabled sameAs functionality', function () {
        let testRepo = 'test-repo' + Date.now();
        // First navigate to create repository for this test
        cy.navigateToPageS('Setup', 'Repositories');
        // // Create new repository with enabled sameAs functionality
        cy.createNewRepoS(testRepo, 'OWL-Horst (Optimized)', true);
        cy.setRepoDefaultS(testRepo);
        cy.selectRepoS(testRepo).wait(1000);

        let updateToExecute = 'PREFIX : <http://test.com/>\n' +
            'PREFIX owl: <http://www.w3.org/2002/07/owl#>\n' +
            '\n' +
            'INSERT DATA {\n' +
            '  :a owl:sameAs :b .\n' +
            '}';

        // Navigate back to SPARQL page
        cy.navigateToPageS('SPARQL');
        // Go to SPARQL and run the following update
        cy.executeCustomQuery(updateToExecute);

        // Verify that one statement has been inserted
        cy.verifyUpdateMessage('Added 1 statements.');

        // click "Expand results over owl:sameAs = OFF" icon on the right of the SPARQL editor.
        cy.get('button#sameAs > span.icon-2-5x').as('disableSameAs');

        cy.get('@disableSameAs').click();
        // Execute following query
        cy.executeCustomQuery('PREFIX : <http://test.com/>\n' +
            '\n' +
            'select * where { \n' +
            '        :a ?p ?o .\n' +
            '}');
        // Verify that there is only one result displaying the link ":a owl:sameAs :a"
        cy.verifyQueryResultsS(1);

        // turn "Expand results over owl:sameAs = "to" ON"
        cy.get('button#sameAs > span.icon-2-5x').click();

        // Execute the same query
        cy.get('div#runButton > #wb-sparql-runQuery').click();


        // Verify that there are two results displaying the links between ":a owl:sameAs :a" and ":a owl:sameAs :b"
        cy.verifyQueryResultsS(2);

        // Should delete the created repository
        cy.deleteRepoS(testRepo).wait(1000);
    });
});
