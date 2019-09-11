import ImportSteps from '../../steps/import-steps';

const FILE_TO_IMPORT = 'wine.rdf';

describe('SPARQL screen validation', () => {
    let repositoryId;

    const DEFAULT_QUERY = 'select * where { \n' +
        '\t?s ?p ?o .\n' +
        '} limit 100';

    const DEFAULT_QUERY_MODIFIED = 'prefix spif: <http://spinrdf.org/spif#>\n' +
        'select * {\n' +
        '    ?x spif:for (1 2000)\n' +
        '} limit 1001';

    function createRepoAndVisit(repoOptions = {}) {
        createRepository(repoOptions);
        visitSparql(true);
    }

    function createRepository(repoOptions = {}) {
        repositoryId = 'sparql-' + Date.now();
        repoOptions.id = repositoryId;
        cy.createRepository(repoOptions);
        cy.initializeRepository(repositoryId);

        // Avoids having to select the repository through the UI
        cy.presetRepositoryCookie(repositoryId);
    }

    function visitSparql(resetLocalStorage) {
        cy.visit('/sparql', {
            onBeforeLoad: (win) => {
                if (resetLocalStorage) {
                    // Needed because the workbench app is very persistent with its local storage (it's hooked on before unload event)
                    // TODO: Add a test that tests this !
                    win.localStorage.clear();
                    win.sessionStorage.clear();
                }
            }
        });

        waitUntilSparqlPageIsLoaded();
    }

    function waitUntilSparqlPageIsLoaded() {
        // Workbench loading screen should not be visible
        cy.get('.ot-splash').should('not.be.visible');

        // Run query button should be clickable
        getRunQueryButton().should('be.visible').and('not.be.disabled');

        waitUntilQueryIsVisible();

        // Editor should have an active tab
        // Giving the editor time to fully initialize
        cy.get(TABS_SELECTOR + '.active .nav-link', {timeout: 30000}).should('be.visible');

        // No active loader
        getLoader().should('not.be.visible');
    }

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    context('SPARQL queries & filtering', () => {
        beforeEach(() => createRepoAndVisit());

        it('Test execute default query', () => {
            getTabs().should('have.length', 1);

            verifyQueryAreaEquals(DEFAULT_QUERY);

            // No queries should have been run for this tab
            getNoQueryRun().should('be.visible');

            executeQuery();

            verifyResultsPageLength(70);
        });

        it('Test modify default query', () => {
            // Run custom query returning 1001 results
            typeQuery(DEFAULT_QUERY_MODIFIED);

            verifyQueryAreaEquals(DEFAULT_QUERY_MODIFIED);

            // Verify pasting also works
            pasteQuery(DEFAULT_QUERY_MODIFIED);

            verifyQueryAreaEquals(DEFAULT_QUERY_MODIFIED);

            executeQuery();

            getResultPages().should('have.length', 2);

            verifyResultsPageLength(1000);

            goToPage(2);

            verifyResultsPageLength(1);
        });

        it('Test filter query results', () => {
            cy.importServerFile(repositoryId, FILE_TO_IMPORT);

            executeQuery();

            // In the search field below the SPARQL editor enter 'White'
            getResultFilterField()
                .should('have.value', '')
                .type('White')
                .should('have.value', 'White');

            // Verify that 6 results containing ''White'' are displayed
            verifyResultsPageLength(6);
        });

        it('Test execute queries with prefixes', () => {
            cy.fixture('queries/prefix-query.sparql').then(prefixQuery => {
                // Yasqe blows when inserting prefixes for some reason....
                disableExceptions();

                typeQuery(prefixQuery);
            });

            // Should have inserted the prefixes
            verifyQueryAreaContains('PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>');
            verifyQueryAreaContains('PREFIX owl: <http://www.w3.org/2002/07/owl#>');

            executeQuery();

            getResultsMessage()
                .should('be.visible');
            getResultsWrapper()
                .should('be.visible');
        });

        it('Test execute (Describe) query', () => {
            let describeQuery = 'DESCRIBE <http://www.ontotext.com/SYSINFO> FROM <http://www.ontotext.com/SYSINFO>';

            pasteQuery(describeQuery);

            verifyQueryAreaEquals(describeQuery);

            executeQuery();

            getResultsMessage()
                .should('be.visible')
                .and('contain', 'Showing results')
                .and('contain', 'Query took');
            getResultsWrapper()
                .should('be.visible');

            // Confirm that all tabs Raw Response, Pivot Table, Google chart are enabled
            getTableResponseButton().should('be.visible').and('not.be.disabled');
            getRawResponseButton().should('be.visible').and('not.be.disabled');
            getPivotTableButton().should('be.visible').and('not.be.disabled');
            getGoogleChartButton().should('be.visible').and('not.be.disabled');

            openDownloadAsMenu();

            getDownloadAsFormatButtons()
                .should('have.length', 10)
                .contains('JSON-LD')
                .should('have.attr', 'data-accepts')
                .and('include', 'application/ld+json')
        });

        it('Test execute (ASK) query', () => {
            let askQuery = 'ASK WHERE { ?s ?p ?o .FILTER (regex(?o, "ontotext.com")) }';

            pasteQuery(askQuery);
            executeQuery();

            // Confirm that all tabs (Table, Pivot Table, Google chart) are disabled
            getTableResponseButton().should('not.be.visible');
            getRawResponseButton().should('not.be.visible');
            getPivotTableButton().should('not.be.visible');
            getGoogleChartButton().should('not.be.visible');

            getBooleanResult().should('be.visible').and('contain', 'NO');
        });

        it('Test execute (CONSTRUCT) query', () => {
            cy.fixture('queries/construct-query.sparql').then(constructQuery => {
                pasteQuery(constructQuery);
            });

            executeQuery();

            getResultsMessage()
                .should('be.visible');
            getResultsWrapper()
                .should('be.visible');

            // Confirm that all tabs (Table, Pivot Table, Google chart) are disabled
            getTableResponseButton().should('be.visible').and('not.be.disabled');
            getRawResponseButton().should('be.visible').and('not.be.disabled');
            getPivotTableButton().should('be.visible').and('not.be.disabled');
            getGoogleChartButton().should('be.visible').and('not.be.disabled');

            openRawResponse();
            getResultsDownloadButton().should('be.visible').and('not.be.disabled');
        });

        it('Test execute query with and without "Including inferred" selected', () => {
            let insertQuery = 'INSERT DATA { <urn:a> <http://a/b> <urn:b> . <urn:b> <http://a/b> <urn:c> . }';

            pasteQuery(insertQuery);
            executeQuery();

            getUpdateMessage().should('be.visible');
            getResultsWrapper().should('not.be.visible');

            // Should be enabled by default
            getInferenceButton()
                .find('.icon-inferred-on')
                .should('be.visible');

            pasteQuery(DEFAULT_QUERY);
            executeQuery();

            // Confirm that all statements are available (70 from ruleset, 2 explicit and 2 inferred)
            getResultsWrapper().should('be.visible');

            verifyResultsPageLength(74);

            // Uncheck ‘Include inferred’
            getInferenceButton()
                .click()
                .find('.icon-inferred-off')
                .should('be.visible');

            // Confirm that only inferred statements (only 2) are available
            executeQuery();
            verifyResultsPageLength(2);
        });
    });

    context('SPARQL queries with OWL-Horst Optimized', () => {
        beforeEach(() => createRepoAndVisit({
            params: {
                ruleset: {
                    value: 'owl-horst-optimized'
                },
                disableSameAs: {
                    value: false
                }
            }
        }));

        it('Test execute query including inferred with ruleset "OWL-Horst (Optimized)"', () => {
            cy.importServerFile(repositoryId, FILE_TO_IMPORT);

            let defaultQueryWithoutLimit = 'select * where { \n' +
                '\t?s ?p ?o .\n' +
                '}';

            pasteQuery(defaultQueryWithoutLimit);
            executeQuery();

            getResultsMessage()
                .should('be.visible')
                .and('contain', '1,000 of 7,065');
            getResultsWrapper()
                .should('be.visible');
            verifyResultsPageLength(1000);

            // Disable the inference from the ">>" icon on the right of the SPARQL editor.
            getInferenceButton()
                .click()
                .find('.icon-inferred-off')
                .should('be.visible');
            executeQuery();

            // Verify that there are 1,839 results
            getResultsMessage()
                .should('be.visible')
                .and('contain', '1,000 of 1,839');
        });

        it('Test execute query including inferred with ruleset "OWL-Horst (Optimized)" enabled sameAs functionality', () => {
            let updateToExecute = 'PREFIX : <http://test.com/>\n' +
                'PREFIX owl: <http://www.w3.org/2002/07/owl#>\n' +
                '\n' +
                'INSERT DATA {\n' +
                '  :a owl:sameAs :b .\n' +
                '}';

            const selectQuery = 'PREFIX : <http://test.com/>\n' +
                '\n' +
                'select * where { \n' +
                '  :a ?p ?o .\n' +
                '}';

            pasteQuery(updateToExecute);
            executeQuery();
            getUpdateMessage()
                .should('be.visible')
                .and('contain', 'Added 1 statements');

            // Should be enabled by default
            getSameAsButton()
                .find('.icon-sameas-on')
                .should('be.visible');

            pasteQuery(selectQuery);
            executeQuery();
            verifyResultsPageLength(2);

            getSameAsButton()
                .click()
                .find('.icon-sameas-off')
                .should('be.visible');

            executeQuery();
            verifyResultsPageLength(1);
        });
    });

    context('SPARQL view & download', () => {
        beforeEach(() => createRepoAndVisit());

        it('Test open a new tab', () => {
            getNewTabButton().click();

            // Verify that as result of clicking addNewTab button we've opened one more tab
            getTabs().should('have.length', 2);

            getLastTab()
                .should('have.class', 'active')
                .find('.nav-link')
                .should('have.text', 'Unnamed');

            verifyQueryAreaContains(DEFAULT_QUERY);

            // No queries for new tab
            getNoQueryRun().should('be.visible');
        });

        it('Test rename a tab', () => {
            let firstTabName = 'Select query';
            let secondTabName = 'Update query';

            renameTab(1, firstTabName);

            // Still one after renaming
            getTabs().should('have.length', 1);

            addTab();

            renameTab(2, secondTabName);

            // TODO: Add spec/steps for cancelling rename

            // Still two after renaming
            getTabs().should('have.length', 2);
            verifyTabName(1, firstTabName);
            verifyTabName(2, secondTabName);

            // Go to a different workbench section and then back
            ImportSteps.visitUserImport();

            visitSparql();

            // Still two after navigation
            getTabs().should('have.length', 2);
            verifyTabName(1, firstTabName);
            verifyTabName(2, secondTabName);
        });

        it('Test close a tab', () => {
            addTab();
            addTab();
            addTab();

            renameTab(1, 'Tab 1');
            renameTab(2, 'Tab 2');
            renameTab(3, 'Tab 3');
            renameTab(4, 'Tab 4');

            closeTab(2);
            confirmModal();
            getModal().should('not.exist');

            closeTab(3);
            confirmModal();
            getModal().should('not.exist');

            getTabs().should('have.length', 2);

            verifyTabName(1, 'Tab 1');
            verifyTabName(2, 'Tab 3');
        });

        it('Test close all tabs except the selected one', () => {
            addTab();
            addTab();
            addTab();

            renameTab(1, 'Tab 1');
            renameTab(2, 'Tab 2');
            renameTab(3, 'Tab 3');
            renameTab(4, 'Tab 4');

            // Holding the shift down until the next command
            cy.get('body').type('{shift}', {release: false});
            closeTab(3);
            confirmModal();
            getModal().should('not.exist');

            getTabs().should('have.length', 1);
            verifyTabName(1, 'Tab 3');
        });

        it('Test download query results in Supported formats', () => {
            executeQuery();

            openDownloadAsMenu();

            getDownloadAsFormatButtons()
                .should('have.length', 5);

            verifyDownloadMenuFormat('JSON', 'application/sparql-results+json');
            verifyDownloadMenuFormat('XML', 'application/sparql-results+xml');
            verifyDownloadMenuFormat('CSV', 'text/csv');
            verifyDownloadMenuFormat('TSV', 'text/tab-separated-values');
            verifyDownloadMenuFormat('Binary RDF Results', 'application/x-binary-rdf-results-table');
        });

        it('Test switch result format tabs', () => {
            executeQuery();

            openRawResponse();
            getResultsWrapper()
                .find('.CodeMirror-code')
                .should('be.visible');

            openPivotTable();
            getResultsWrapper()
                .find('.pivotTable table.pvtUi')
                .should('be.visible');

            // GCharts blows sometimes and breaks the test
            disableExceptions();

            openGoogleChart();
            getResultsWrapper()
                .find('#yasr-inner_gchartWrapper .google-visualization-table')
                .should('be.visible');
        });

        it('Test change views', () => {
            viewEditorOnly();

            // Verify that only Editor tab is displayed
            cy.get(EDITOR_SELECTOR).should('be.visible');
            cy.get(YASR_INNER_SELECTOR).should('not.be.visible');

            viewEditorAndResults();

            // Verify that both Editor and Results tabs are displayed
            cy.get(EDITOR_SELECTOR).should('be.visible');
            cy.get(YASR_INNER_SELECTOR).should('be.visible');

            viewResultsOnly();

            // Verify that only Results tab is displayed
            cy.get(EDITOR_SELECTOR).should('not.be.visible');
            cy.get(YASR_INNER_SELECTOR).should('be.visible');

            viewEditorAndResults();

            // Check that they are horizontal
            cy.get('#sparql-content > div').should('have.class', 'row');
            cy.get(YASR_SELECTOR).should('not.have.class', 'vertical');

            // Change the orientation to vertical
            changeViewOrientation();

            // Verify that all elements are visible and properly displayed.
            cy.get(EDITOR_SELECTOR).should('be.visible');
            cy.get(YASR_INNER_SELECTOR).should('be.visible');

            // Check that they are vertical
            cy.get('#sparql-content > div').should('not.have.class', 'row');
            cy.get(YASR_SELECTOR).should('have.class', 'vertical');

            // Run the default query on vertical mode
            executeQuery();
            // Verify that all results are properly scaled/displayed
            verifyResultsPageLength(70);

            // Return the orientation to horizontal
            changeViewOrientation();

            cy.get('#sparql-content > div').should('have.class', 'row');
            cy.get(YASR_SELECTOR).should('not.have.class', 'vertical');
        });
    });

    context('Saved queries & links', () => {
        beforeEach(() => createRepoAndVisit());

        const QUERY_FOR_SAVING = 'select (count (*) as ?cnt)\n' +
            'where {\n' +
            '    ?s ?p ?o .\n' +
            '}';

        const QUERY_FOR_SAVING_MODIFIED = 'select (count (*) as ?cnt)\n' +
            'where {\n' +
            '    ?s1 ?p1 ?o1 .\n' +
            '}';

        function waitUntilSavedQueryModalIsVisible() {
            getModal().should('be.visible');
            getSavedQueryForm().should('be.visible');
            getSubmitSavedQueryBtn()
                .should('be.visible')
                .and('not.be.disabled');
        }

        it('Test create, edit and delete saved query', () => {
            let savedQueryName = 'Saved query - ' + Date.now();

            pasteQuery(QUERY_FOR_SAVING);

            saveQuery();
            waitUntilSavedQueryModalIsVisible();

            getSavedQueryNameField()
                .type(savedQueryName)
                .should('have.value', savedQueryName);
            submitSavedQuery();

            getSavedQueryForm().should('not.exist');

            // Verify that the query is saved
            openSavedQueriesPopup();
            getPopover()
                .should('be.visible')
                .and('contain', savedQueryName);

            // Press the pen icon to edit the custom query created earlier
            editSaveQueryFromPopup(savedQueryName);

            getPopover().should('not.exist');
            waitUntilSavedQueryModalIsVisible();

            getSavedQueryNameField().should('have.value', savedQueryName);
            getSavedQueryField()
                .should('have.value', QUERY_FOR_SAVING)
                .clear()
                .type(QUERY_FOR_SAVING_MODIFIED)
                .should('have.value', QUERY_FOR_SAVING_MODIFIED);
            submitSavedQuery();

            getSavedQueryForm().should('not.exist');

            // Verify that the query is edited.
            // Select the query from the saved queries again
            openSavedQueriesPopup();
            getPopover()
                .should('be.visible')
                .and('contain', savedQueryName);

            editSaveQueryFromPopup(savedQueryName);

            waitUntilSavedQueryModalIsVisible();

            getSavedQueryNameField().should('have.value', savedQueryName);
            getSavedQueryField().should('have.value', QUERY_FOR_SAVING_MODIFIED);

            // Close edit saved query dialog
            submitSavedQuery();

            // Click on the saved queries icon
            openSavedQueriesPopup();
            getPopover()
                .should('be.visible')
                .and('contain', savedQueryName);

            // Press the trash bin to delete the custom query created earlier
            deleteSaveQueryFromPopup(savedQueryName);

            // Confirm dialog
            confirmModal();
            getModal().should('not.exist');
            getPopover().should('not.exist');

            // Verify that the query is deleted
            openSavedQueriesPopup();
            getPopover()
                .should('be.visible')
                .and('not.contain', savedQueryName);
        });

        it('Test save invalid Sample Queries', () => {
            // Try to save Sample Queries without specifying query name
            saveQuery();
            waitUntilSavedQueryModalIsVisible();

            submitSavedQuery();
            getSavedQueryErrors()
                .find('.empty-query-name-err')
                .should('be.visible')
                .and('contain', 'Name cannot be empty!');

            // Type query name, remove content add try to save the query
            getSavedQueryNameField()
                .type('My query')
                .should('have.value', 'My query');
            getSavedQueryField()
                .clear()
                .should('not.have.value');

            submitSavedQuery();
            getSavedQueryErrors()
                .find('.empty-query-err')
                .should('be.visible')
                .and('contain', 'Query cannot be empty!');

            // Try to save a query with name that already exists -> Add statements
            getSavedQueryNameField()
                .clear()
                .type('Add statements')
                .should('have.value', 'Add statements');
            getSavedQueryField()
                .type(QUERY_FOR_SAVING);

            // The form is valid, the modal should disappear and then reappear with an error
            getSubmitSavedQueryBtn()
                .click()
                .should('not.exist');
            waitUntilSavedQueryModalIsVisible();

            getSavedQueryErrors()
                .find('.query-exists-error')
                .should('be.visible')
                .and('contain', 'Query with name \'Add statements\' already exists!');
        });

        it('Test run saved queries', () => {
            // Execute all default saved queries

            // Execute the default sample Add Statements
            selectSavedQuery('Add statements');
            getTabs().should('have.length', 2);
            getActiveTabLink().should('have.text', 'Add statements');
            getQueryArea().should('contain', 'INSERT DATA');
            executeQuery();
            // Verify query information: “Added 2 statements”
            getUpdateMessage()
                .should('contain', 'Added 2 statements.')
                .and('contain', 'Update took');

            // Execute the default sample Remove statements
            selectSavedQuery('Remove statements');
            getTabs().should('have.length', 3);
            getActiveTabLink().should('have.text', 'Remove statements');
            getQueryArea().should('contain', 'DELETE DATA');
            executeQuery();
            getUpdateMessage()
                .should('contain', 'Removed 2 statements.')
                .and('contain', 'Update took');

            // Execute the default sample Clear Graph
            selectSavedQuery('Clear graph');
            getTabs().should('have.length', 4);
            getActiveTabLink().should('have.text', 'Clear graph');
            getQueryArea().should('contain', 'CLEAR GRAPH');
            executeQuery();
            getUpdateMessage()
                .should('contain', 'The number of statements did not change.')
                .and('contain', 'Update took');

            // Execute the default SPARQL Select template
            selectSavedQuery('SPARQL Select template');
            getTabs().should('have.length', 5);
            getActiveTabLink().should('have.text', 'SPARQL Select template');
            getQueryArea().should('contain', 'SELECT');
            executeQuery();
            getUpdateMessage().should('not.be.visible');
            getResultsMessage()
                .should('contain', 'Showing results from 1 to 74 of 74')
                .and('contain', 'Query took');

            verifyResultsPageLength(74);
        });

        it('Test saved query link', () => {
            const queryName = 'Add statements';
            openSavedQueriesPopup();
            getPopover().should('be.visible');

            openSavedQueryLinkFromPopup(queryName);

            const expectedUrl = Cypress.config().baseUrl + '/sparql?savedQueryName=' + encodeURI(queryName);
            getModal()
                .should('be.visible')
                .find('#clipboardURI')
                .should('have.value', expectedUrl);

            // Visit performs full page load
            cy.visit(expectedUrl);
            waitUntilSparqlPageIsLoaded();

            getTabs().should('have.length', 2);
            getActiveTabLink().should('have.text', queryName);

            // Wait until editor is initialized with the query and then assert the whole query
            getQueryArea().should('contain', 'INSERT DATA');
            cy.fixture('queries/add-statement.txt').then((query) => {
                verifyQueryAreaEquals(query);
            });
        });

        it('Test URL to current query', () => {
            const query = 'SELECT ?sub ?pred ?obj WHERE {?sub ?pred ?obj .} LIMIT 100';
            pasteQuery(query);

            // Press the link icon to generate a link for a query
            getQueryLinkBtn().click();

            // TODO: Test with tab name -> should open such tab if it was deleted

            // TODO: Test with different values for infer & same as

            const encodedQuery = 'SELECT+%3Fsub+%3Fpred+%3Fobj+WHERE+%7B%3Fsub+%3Fpred+%3Fobj+.%7D+LIMIT+100';
            const expectedUrl = Cypress.config().baseUrl + '/sparql?name=&infer=true&sameAs=true&query=' + encodedQuery;
            getModal()
                .should('be.visible')
                .find('#clipboardURI')
                .should('have.value', expectedUrl);

            // Visit performs full page load
            cy.visit(expectedUrl);
            waitUntilSparqlPageIsLoaded();

            getTabs().should('have.length', 1);

            // Wait until editor is initialized with the query and then assert the whole query
            getQueryArea().should('contain', 'SELECT');
            verifyQueryAreaEquals(query);
        });
    });

    context('SPARQL with autocomplete', () => {
        const queryBegin = 'select * where { ';
        const queryEnd = ' ?s ?p . } limit 100';
        const wineUri = '<http://www.w3.org/TR/2003/PR-owl-guide-20031209/wine#CorbansDryWhiteRiesling>';

        it('should suggest resources in the "SPARQL" editor when autocomplete is enabled', () => {
            createRepository();

            cy.importServerFile(repositoryId, FILE_TO_IMPORT);

            cy.enableAutocomplete(repositoryId);
            visitSparql(true);

            const expectedQuery = queryBegin + wineUri + queryEnd;

            clearQuery();

            typeQuery(queryBegin, false);
            typeQuery('Dry{ctrl} ', false, true);

            getAutoSuggestHints()
                .should('be.visible')
                .and('have.length', 7)
                .contains('CorbansDryWhiteRiesling')
                .click()
                .should('not.exist');

            typeQuery(queryEnd, false);

            verifyQueryAreaEquals(expectedQuery);

            executeQuery();

            getResultsWrapper().should('be.visible');

            verifyResultsPageLength(10);
        });

        it('should not suggests resources in the "SPARQL" editor if the autocomplete is NOT enabled', () => {
            createRepoAndVisit();

            clearQuery();

            typeQuery(queryBegin, false);
            typeQuery('Dry{ctrl} ', false, true);

            getAutoSuggestHints().should('not.exist');
            getToast()
                .find('.toast-warning')
                .should('be.visible')
                .and('contain', 'Autocomplete is OFF');
        });
    });

    const TABS_SELECTOR = '#sparql-content .nav-tabs .sparql-tab';
    const EDITOR_SELECTOR = '#queryEditor';
    const YASR_SELECTOR = '#yasr';
    const YASR_INNER_SELECTOR = '#yasr-inner';

    function executeQuery() {
        getRunQueryButton().click();
        getLoader().should('not.be.visible');
    }

    function getLoader() {
        return cy.get('.ot-loader-new-content');
    }

    // TODO: waitAnimation() command ?
    function getPopover() {
        return cy.get('.popover').should('not.have.class', 'ng-animate');
    }

    function getRunQueryButton() {
        return cy.get('#wb-sparql-runQuery');
    }

    function getTableResultRows() {
        return getResultsWrapper().find('.resultsTable tbody tr');
    }

    function verifyResultsPageLength(resultLength) {
        getTableResultRows()
            .should('have.length', resultLength);
    }

    function getResultPagination() {
        return cy.get('#yasr .nav.pagination');
    }

    function getResultPages() {
        return getResultPagination().find('li')
    }

    function getModal() {
        // Increased timeout to allow dialog to show and finish its animation..
        // Should not be needed but it seems animations in Travis are slow..
        return cy.get('.modal', {timeout: 10000}).should('not.have.class', 'ng-animate');
    }

    function confirmModal() {
        getModal()
            .should('be.visible')
            .find('.modal-footer')
            .should('be.visible')
            .find('.btn-primary')
            .click();
    }

    function getTabs() {
        return cy.get(TABS_SELECTOR);
    }

    function getActiveTabLink() {
        return cy.get(TABS_SELECTOR + '.active .nav-link');
    }

    function getNewTabButton() {
        return cy.get('#wb-sparql-addNewTab');
    }

    function addTab() {
        getNewTabButton().click();
    }

    function getLastTab() {
        return getTabs().last();
    }

    function renameTab(position, newName) {
        getTabs().eq(position - 1).then(tab => {
            cy.wrap(tab)
            // First click is to focus it in case it's not the active tab
                .click()
                .find('.nav-link')
                .dblclick();
            cy.wrap(tab)
                .find('.editable-input')
                .type(newName)
                .should('have.value', newName);
            cy.wrap(tab)
                .find('.editable-buttons .btn-primary')
                .click()
                .should('not.exist');
        });
    }

    function verifyTabName(position, name) {
        getTabs().eq(position - 1)
            .should('be.visible')
            .find('.nav-link')
            .should('have.text', name);
    }

    function getTabCloseBtn(position) {
        return getTabs().eq(position - 1).find('.delete-sparql-tab-btn');
    }

    function closeTab(position) {
        getTabCloseBtn(position).click();
    }

    function verifyQueryAreaContains(query) {
        // Using the CodeMirror instance because getting the value from the DOM is very cumbersome
        getQueryArea().should(codeMirrorEl => {
            const cm = codeMirrorEl[0].CodeMirror;
            expect(cm.getValue().includes(query)).to.be.true;
        });
    }

    function verifyQueryAreaEquals(query) {
        // Using the CodeMirror instance because getting the value from the DOM is very cumbersome
        getQueryArea().should(codeMirrorEl => {
            const cm = codeMirrorEl[0].CodeMirror;
            expect(cm.getValue().trim()).to.equal(query.trim());
        });
    }

    function waitUntilQueryIsVisible() {
        getQueryArea().should(codeMirrorEl => {
            const cm = codeMirrorEl[0].CodeMirror;
            expect(cm.getValue().trim().length > 0).to.be.true;
        });
    }

    function getQueryArea() {
        return cy.get('#queryEditor .CodeMirror');
    }

    function getQueryTextArea() {
        return getQueryArea().find('textarea');
    }

    function getNoQueryRun() {
        return cy.get('#yasr-inner .no-query-run');
    }

    function clearQuery() {
        // Using force because the textarea is not visible
        getQueryTextArea().type('{ctrl}a{backspace}', {force: true});
    }

    function typeQuery(query, clear = true, parseSpecialCharSequences = false) {
        if (clear) {
            clearQuery();
        }
        // Using force because the textarea is not visible
        getQueryTextArea().type(query, {force: true, parseSpecialCharSequences});
    }

    function pasteQuery(query) {
        clearQuery();
        // Using force because the textarea is not visible
        getQueryTextArea().invoke('val', query).trigger('change', {force: true});
        waitUntilQueryIsVisible();
    }

    function goToPage(page) {
        getResultPages().contains(page).click();
        getLoader().should('not.be.visible');
    }

    function getResultFilterField() {
        return cy.get('#yasr input[type="search"]');
    }

    function getTableResponseButton() {
        return cy.get('#yasr .select_table');
    }

    function getRawResponseButton() {
        return cy.get('#yasr .select_rawResponse');
    }

    function openRawResponse() {
        getRawResponseButton().click();
    }

    function getPivotTableButton() {
        return cy.get('#yasr .select_pivot');
    }

    function openPivotTable() {
        getPivotTableButton().click();
    }

    function getGoogleChartButton() {
        return cy.get('#yasr .select_gchart');
    }

    function openGoogleChart() {
        getGoogleChartButton().click();
    }

    function getEditorOnlyButton() {
        return cy.get('#hideEditor .editor-only-btn');
    }

    function viewEditorOnly() {
        getEditorOnlyButton().click();
    }

    function getEditorAndResultsButton() {
        return cy.get('#hideEditor .editor-and-results-btn');
    }

    function viewEditorAndResults() {
        getEditorAndResultsButton().click();
    }

    function getResultsOnlyButton() {
        return cy.get('#hideEditor .results-only-btn');
    }

    function viewResultsOnly() {
        getResultsOnlyButton().click();
    }

    function getViewOrientationButton() {
        return cy.get('#hideEditor .toggle-horizontal-view-btn');
    }

    function changeViewOrientation() {
        getViewOrientationButton().click();
    }

    function getSaveQueryBtn() {
        return cy.get('#wb-sparql-saveQuery');
    }

    function saveQuery() {
        getSaveQueryBtn().click();
    }

    function getSavedQueryForm() {
        return cy.get('.modal .save-query-form');
    }

    function getSubmitSavedQueryBtn() {
        return cy.get('#wb-sparql-submit');
    }

    function submitSavedQuery() {
        getSubmitSavedQueryBtn().click();
    }

    function getSavedQueryNameField() {
        return cy.get('#wb-sparql-sampleName');
    }

    function getSavedQueryErrors() {
        return getSavedQueryForm().find('.saved-query-errors');
    }

    function getSavedQueryField() {
        return cy.get('#wb-sparql-sampleValue');
    }

    function getSavedQueriesPopupBtn() {
        return cy.get('#wb-sparql-toggleSampleQueries');
    }

    function openSavedQueriesPopup() {
        getSavedQueriesPopupBtn().click();

    }

    function getSavedQueryFromPopup(savedQueryName) {
        return cy.get('#wb-sparql-queryInSampleQueries')
            .contains(savedQueryName)
            .closest('.saved-query');
    }

    function selectSavedQuery(savedQueryName) {
        openSavedQueriesPopup();
        getPopover().should('be.visible');
        getSavedQueryFromPopup(savedQueryName)
            .find('a')
            .click();
    }

    function editSaveQueryFromPopup(savedQueryName) {
        getSavedQueryFromPopup(savedQueryName)
            .trigger('mouseover')
            .find('.actions-bar')
            .should('be.visible')
            .find('.icon-edit')
            .parent('.btn')
            // Cypress sometimes determines the element has 0x0 dimensions...
            .click({force: true});
    }

    function deleteSaveQueryFromPopup(savedQueryName) {
        getSavedQueryFromPopup(savedQueryName)
            .trigger('mouseover')
            .find('.actions-bar')
            .should('be.visible')
            .find('.icon-trash')
            .parent('.btn')
            // Cypress sometimes determines the element has 0x0 dimensions...
            .click({force: true});
    }

    function openSavedQueryLinkFromPopup(savedQueryName) {
        getSavedQueryFromPopup(savedQueryName)
            .trigger('mouseover')
            .find('.actions-bar')
            .should('be.visible')
            .find('.icon-link')
            .parent('.btn')
            // Cypress sometimes determines the element has 0x0 dimensions...
            .click({force: true});
    }

    function getUpdateMessage() {
        return cy.get('#yasr-inner .alert-info.update-info');
    }

    function getResultsMessage() {
        return cy.get('#yasr-inner .alert-info.results-info');
    }

    function getQueryLinkBtn() {
        return cy.get('#wb-sparql-copyToClipboardQuery');
    }

    function getResultsWrapper() {
        return cy.get('#yasr-inner .yasr_results');
    }

    function getResultsHeader() {
        return cy.get('#yasr .yasr_header');
    }

    function getDownloadAsMenuButton() {
        return getResultsHeader().find('.saveAsDropDown > .btn');
    }

    function openDownloadAsMenu() {
        getDownloadAsMenuButton().click();
    }

    function getDownloadAsFormatButtons() {
        return getResultsHeader().find('.saveAsDropDown .dropdown-menu .dropdown-item');
    }

    function verifyDownloadMenuFormat(rdfFormat, mimetype) {
        getDownloadAsFormatButtons()
            .contains(rdfFormat)
            .and('have.attr', 'data-accepts')
            .and('include', mimetype);
    }

    function disableExceptions() {
        cy.on('uncaught:exception', () => {
            return false;
        });
    }

    function getBooleanResult() {
        return getResultsWrapper().find('.booleanBootResult');
    }

    function getResultsDownloadButton() {
        return getResultsHeader().find('.yasr_downloadIcon');
    }

    function getInferenceButton() {
        return cy.get('#inference');
    }

    function getSameAsButton() {
        return cy.get('#sameAs');
    }

    function getAutoSuggestHints() {
        return cy.get('.CodeMirror-hints .CodeMirror-hint');
    }

    function getToast() {
        return cy.get('#toast-container');
    }

});
