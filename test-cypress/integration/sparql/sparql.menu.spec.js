import ImportSteps from '../../steps/import-steps';
import SparqlSteps from '../../steps/sparql-steps';

const FILE_TO_IMPORT = 'wine.rdf';
const RDF_STAR_FILE_TO_IMPORT = 'turtlestar-data.ttls';

describe('SPARQL screen validation', () => {
    let repositoryId;

    const EDIT_SAVED_QUERY_COMMAND = '.icon-edit';
    const DELETE_SAVED_QUERY_COMMAND = '.icon-trash';
    const OPEN_SAVED_QUERY_COMMAND = '.icon-link';

    const DEFAULT_QUERY = 'select * where { \n' +
        '\t?s ?p ?o .\n' +
        '} limit 100';

    const DEFAULT_QUERY_MODIFIED = 'prefix spif: <http://spinrdf.org/spif#> select * {?x spif:for (1 2000)} limit 1001';

    const SPARQL_STAR_QUERY = 'select (<<?s ?p ?o>> as ?t) {?s ?p ?o}';

    const GATE_CLIENT_CREATE_QUERY = 'PREFIX : <http://www.ontotext.com/textmining#>\n' +
        'PREFIX inst: <http://www.ontotext.com/textmining/instance#>\n' +
        'INSERT DATA {\n' +
        '    inst:gateService :connect :Gate;\n' +
        '                     :service "https://cloud-api.gate.ac.uk/process-document/annie-named-entity-recognizer?annotations=:Address&annotations=:Date&annotations=:Location&annotations=:Organization&annotations=:Person&annotations=:Money&annotations=:Percent&annotations=:Sentence" .\n' +
        '}';

    const GATE_CLIENT_SEARCH_QUERY = 'PREFIX : <http://www.ontotext.com/textmining#>\n' +
        'PREFIX inst: <http://www.ontotext.com/textmining/instance#>\n' +
        'SELECT ?annotationText ?annotationType ?annotationStart ?annotationEnd ?feature ?value\n' +
        'WHERE {\n' +
        '        ?searchDocument a inst:gateService;\n' +
        '                           :text \'\'\'Dyson Ltd. plans to hire 450 people globally, with more than half the recruits in its headquarters in Singapore.\n' +
        'The company best known for its vacuum cleaners and hand dryers will add 250 engineers in the city-state. This comes short before the founder James Dyson announced he is moving back to the UK after moving residency to Singapore. Dyson, a prominent Brexit supporter who is worth US$29 billion, faced criticism from British lawmakers for relocating his company\'\'\' .\n' +
        '\n' +
        '    graph inst:gateService {\n' +
        '        ?annotatedDocument :annotations ?annotation .\n' +
        '\n' +
        '        ?annotation :annotationText ?annotationText ;\n' +
        '            :annotationType ?annotationType ;\n' +
        '            :annotationStart ?annotationStart ;\n' +
        '            :annotationEnd ?annotationEnd ;\n' +
        '        optional { ?annotation :features ?item . ?item ?feature ?value }\n' +
        '    }\n' +
        '}';

    const LIST_TEXT_MINING_SERVICES = 'PREFIX : <http://www.ontotext.com/textmining#>\n' +
        'PREFIX inst: <http://www.ontotext.com/textmining/instance#>\n' +
        'SELECT * where {\n' +
        '    ?instance a :Service .\n' +
        '}';

    const LIST_TEXT_MINING_INSTANCE_CONFIG = 'PREFIX : <http://www.ontotext.com/textmining#>\n' +
        'PREFIX inst: <http://www.ontotext.com/textmining/instance#>\n' +
        'SELECT * WHERE {\n' +
        '   inst:gateService ?p ?o .\n' +
        '}';

    const DROP_TEXT_MINING_INSTANCE = 'PREFIX : <http://www.ontotext.com/textmining#>\n' +
        'PREFIX inst: <http://www.ontotext.com/textmining/instance#>\n' +
        'INSERT DATA {\n' +
        '   inst:gateService :dropService "".\n' +
        '}';

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    context('SPARQL queries & filtering', () => {
        beforeEach(() => {
            repositoryId = 'sparql-' + Date.now();
            SparqlSteps.createRepoAndVisit(repositoryId)
        });

        it('Test execute default query', () => {
            SparqlSteps.getTabs().should('have.length', 1);

            verifyQueryAreaEquals(DEFAULT_QUERY);

            // No queries should have been run for this tab
            SparqlSteps.getNoQueryRunInfo().should('be.visible');

            SparqlSteps.executeQuery();

            verifyResultsPageLength(70);
        });

        it('Test modify default query', () => {
            // Run custom query returning 1001 results
            SparqlSteps.typeQuery(DEFAULT_QUERY_MODIFIED);

            verifyQueryAreaEquals(DEFAULT_QUERY_MODIFIED);

            // Verify pasting also works
            cy.pasteQuery(DEFAULT_QUERY_MODIFIED);

            SparqlSteps.executeQuery();

            getResultPages().should('have.length', 2);

            verifyResultsPageLength(1000);

            goToPage(2);

            verifyResultsPageLength(1);
        });

        it('Test execute sparqlstar query', () => {
            cy.importServerFile(repositoryId, RDF_STAR_FILE_TO_IMPORT);

            SparqlSteps.typeQuery(SPARQL_STAR_QUERY);

            verifyQueryAreaEquals(SPARQL_STAR_QUERY);

            SparqlSteps.executeQuery();

            getResultPages().should('have.length', 1);

            verifyResultsPageLength(104);

            SparqlSteps.getTableResultRows().should('contain', '<<');

            SparqlSteps.getTableResultRows().should('contain', 'http://bigdata.com/RDF#bob');
        });

        it('Test execute sparqlstar select with bind query', () => {
            cy.importServerFile(repositoryId, RDF_STAR_FILE_TO_IMPORT);

            let selectQuery = 'select * {bind (<<?s ?p ?o>> as ?t) .}';

            SparqlSteps.typeQuery(selectQuery);

            verifyQueryAreaEquals(selectQuery);

            SparqlSteps.executeQuery();

            getResultPages().should('have.length', 1);

            verifyResultsPageLength(3);

            SparqlSteps.getTableResultRows().should('contain', '<<');

            SparqlSteps.getTableResultRows().should('contain', 'http://bigdata.com/RDF#bob');
        });

        it('Test execute sparqlstar insert query', () => {
            cy.importServerFile(repositoryId, RDF_STAR_FILE_TO_IMPORT);

            let insertQuery = 'insert data {<<<urn:a> <urn:p> 1>> <urn:x> 2}';

            SparqlSteps.typeQuery(insertQuery);

            verifyQueryAreaEquals(insertQuery);

            SparqlSteps.executeQuery();

            getUpdateMessage()
                .should('be.visible')
                .and('contain', 'Added 1 statements');

            getResultPages().should('have.length', 1);
        });

        it('Test execute sparqlstar select searching for inserted results', () => {
            cy.importServerFile(repositoryId, RDF_STAR_FILE_TO_IMPORT);

            let selectQuery = "PREFIX bd: <http://bigdata.com/RDF#>\nPREFIX foaf: <http://xmlns.com/foaf/0.1/>\n" +
                "select * where {<<bd:bob foaf:mbox <mailto:bob@home>>> ?p ?o .}";

            SparqlSteps.typeQuery(selectQuery);

            verifyQueryAreaEquals(selectQuery);

            SparqlSteps.executeQuery();

            getResultPages().should('have.length', 1);

            verifyResultsPageLength(4);

            SparqlSteps.getTableResultRows().should('contain', 'http://hr.example.com/employees/bob');
        });

        it('Test execute sparqlstar delete query and search for deleted triple', () => {
            cy.importServerFile(repositoryId, RDF_STAR_FILE_TO_IMPORT);

            let deleteQuery = "PREFIX bd: <http://bigdata.com/RDF#>\nPREFIX foaf: <http://xmlns.com/foaf/0.1/>\n" +
                "PREFIX dc: <http://purl.org/dc/terms/>\nPREFIX re: <http://reasoner.example.com/engines#>\n" +
                "delete data {<<bd:alice foaf:knows bd:bob>> dc:source re:engine_1.}";

            SparqlSteps.typeQuery(deleteQuery);

            verifyQueryAreaEquals(deleteQuery);

            SparqlSteps.executeQuery();

            getUpdateMessage()
                .should('be.visible')
                .and('contain', 'Removed 1 statements');

            getResultPages().should('have.length', 1);

            let selectQuery = "PREFIX bd: <http://bigdata.com/RDF#>\nPREFIX foaf: <http://xmlns.com/foaf/0.1/>\n" +
                "PREFIX dc: <http://purl.org/dc/terms/>\nPREFIX re: <http://reasoner.example.com/engines#>\n" +
                "select * where {<<bd:alice foaf:knows bd:bob>> dc:source re:engine_1.}";

            SparqlSteps.typeQuery(selectQuery);

            verifyQueryAreaEquals(selectQuery);

            SparqlSteps.executeQuery();

            getResultPages().should('have.length', 1);

            //verifyResultsPageLength(1);

            cy.get('.results-info .results-description')
                .should('be.visible')
                .and('contain', 'No results');

        });

        it('Test execute (Describe with bind) sparqlstar query', () => {
            cy.importServerFile(repositoryId, RDF_STAR_FILE_TO_IMPORT);

            let describeQuery = 'describe ?t {bind (<<?s ?p ?o>> as ?t) .}';

            cy.waitUntilQueryIsVisible();
            cy.pasteQuery(describeQuery);

            SparqlSteps.executeQuery();

            cy.verifyResultsMessage('Showing results');
            cy.verifyResultsMessage('Query took');

            SparqlSteps.getResultsWrapper()
                .should('be.visible');

            getResultPages().should('have.length', 1);
            verifyResultsPageLength(9);

            SparqlSteps.getTableResultRows().should('contain', '<<');

            SparqlSteps.getTableResultRows().should('contain', 'http://bigdata.com/RDF#bob');

            // Confirm that all tabs Raw Response, Pivot Table, Google chart are enabled
            getTableResponseButton().should('be.visible').and('not.be.disabled');
            getRawResponseButton().should('be.visible').and('not.be.disabled');
            getPivotTableButton().should('be.visible').and('not.be.disabled');
            getGoogleChartButton().should('be.visible').and('not.be.disabled');
        });

        it('Should check for XML star download format', () => {
            cy.importServerFile(repositoryId, RDF_STAR_FILE_TO_IMPORT);

            SparqlSteps.typeQuery(SPARQL_STAR_QUERY);

            verifyQueryAreaEquals(SPARQL_STAR_QUERY);

            SparqlSteps.executeQuery();

            getResultPages().should('have.length', 1);

            cy.get('.saveAsDropDown').click().within(() => {
                cy.get('.dropdown-menu')
                    .should('be.visible')
                    .and('contain', 'XML*');
            });
        });


        it('Test filter query results', () => {
            cy.importServerFile(repositoryId, FILE_TO_IMPORT);

            SparqlSteps.executeQuery();

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

                SparqlSteps.typeQuery(prefixQuery);
            });

            // Should have inserted the prefixes
            verifyQueryAreaContains('PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>');
            verifyQueryAreaContains('PREFIX owl: <http://www.w3.org/2002/07/owl#>');

            SparqlSteps.executeQuery();

            cy.getResultsMessage();
            SparqlSteps.getResultsWrapper()
                .should('be.visible');
        });

        it('Test execute (Describe) query', () => {
            let describeQuery = 'DESCRIBE <http://www.ontotext.com/SYSINFO> FROM <http://www.ontotext.com/SYSINFO>';

            cy.waitUntilQueryIsVisible();
            cy.pasteQuery(describeQuery);

            SparqlSteps.executeQuery();

            cy.verifyResultsMessage('Showing results')
            cy.verifyResultsMessage('Query took');
            SparqlSteps.getResultsWrapper()
                .should('be.visible');

            // Confirm that all tabs Raw Response, Pivot Table, Google chart are enabled
            getTableResponseButton().should('be.visible').and('not.be.disabled');
            getRawResponseButton().should('be.visible').and('not.be.disabled');
            getPivotTableButton().should('be.visible').and('not.be.disabled');
            getGoogleChartButton().should('be.visible').and('not.be.disabled');

            openDownloadAsMenu();

            getDownloadAsFormatButtons()
                .should('have.length', 13)
                .contains('JSON-LD')
                .should('have.attr', 'data-accepts')
                .and('include', 'application/ld+json')
        });

        it('Test execute (ASK) query', () => {
            let askQuery = 'ASK WHERE { ?s ?p ?o .FILTER (regex(?o, "ontotext.com")) }';

            cy.waitUntilQueryIsVisible();
            cy.pasteQuery(askQuery);
            SparqlSteps.executeQuery();

            // Confirm that all tabs (Table, Pivot Table, Google chart) are disabled
            getTableResponseButton().should('not.be.visible');
            getRawResponseButton().should('not.be.visible');
            getPivotTableButton().should('not.be.visible');
            getGoogleChartButton().should('not.be.visible');

            getBooleanResult().should('be.visible').and('contain', 'NO');
        });

        // This test depends on external service http://factforge.net/repositories/ff-news which can occasionally fail.
        it.skip('Test execute (CONSTRUCT) query', () => {
            cy.fixture('queries/construct-query.sparql').then(constructQuery => {
                cy.waitUntilQueryIsVisible();
                cy.pasteQuery(constructQuery);
            });

            SparqlSteps.executeQuery();

            cy.getResultsMessage();
            SparqlSteps.getResultsWrapper()
                .should('be.visible');

            // Confirm that all tabs (Table, Pivot Table, Google chart) are disabled
            getTableResponseButton().should('be.visible').and('not.be.disabled');
            getRawResponseButton().should('be.visible').and('not.be.disabled');
            getPivotTableButton().should('be.visible').and('not.be.disabled');
            getGoogleChartButton().should('be.visible').and('not.be.disabled');

            openRawResponse();
            getResultsDownloadButton().should('be.visible').and('not.be.disabled');
        });

        it('should test text mining plugin', () => {
            cy.waitUntilQueryIsVisible();
            cy.pasteQuery(GATE_CLIENT_CREATE_QUERY);
            cy.executeQuery();
            cy.pasteQuery(GATE_CLIENT_SEARCH_QUERY);
            cy.executeQuery();
            getResultPages().should('have.length', 1);
            verifyResultsPageLength(44);
            cy.pasteQuery(LIST_TEXT_MINING_SERVICES);
            cy.executeQuery();
            SparqlSteps.getTableResultRows().should('contain', 'http://www.ontotext.com/textmining/instance#gateService');
            cy.pasteQuery(LIST_TEXT_MINING_INSTANCE_CONFIG);
            cy.executeQuery();
            SparqlSteps.getTableResultRows().should('contain', 'http://www.ontotext.com/textmining#Gate');
            SparqlSteps.getTableResultRows().should('contain', 'http://www.ontotext.com/textmining#connect');
            SparqlSteps.getTableResultRows().should('contain', 'https://cloud-api.gate.ac.uk');
            cy.pasteQuery(DROP_TEXT_MINING_INSTANCE);
            cy.executeQuery();
            cy.pasteQuery(LIST_TEXT_MINING_SERVICES);
            cy.executeQuery();
            getResultPages().should('have.length', 1);
            SparqlSteps.getTableResultRows().should('contain', 'No data available in table');
        });
    });

    context('SPARQL queries with OWL-Horst Optimized', () => {
        beforeEach(() => {
            repositoryId = 'sparql-' + Date.now();
            SparqlSteps.createRepoAndVisit(repositoryId, {
                params: {
                    ruleset: {
                        value: 'owl-horst-optimized'
                    },
                    disableSameAs: {
                        value: false
                    }
                }
            })
        });

        it('Test execute query including inferred with ruleset "OWL-Horst (Optimized)"', () => {
            cy.importServerFile(repositoryId, FILE_TO_IMPORT);

            let defaultQueryWithoutLimit = 'select * where { \n' +
                '\t?s ?p ?o .\n' +
                '}';

            cy.waitUntilQueryIsVisible();
            cy.pasteQuery(defaultQueryWithoutLimit);
            SparqlSteps.executeQuery();

            cy.verifyResultsMessage('1,000 of 7,065');
            SparqlSteps.getResultsWrapper()
                .should('be.visible');
            verifyResultsPageLength(1000);

            // Disable the inference from the ">>" icon on the right of the SPARQL editor.
            cy.waitUntil(() =>
                getInferenceButton().find('.icon-inferred-on')
                    .then(infBtn => infBtn && cy.wrap(infBtn).click()))
                .then(() =>
                    cy.get('.icon-inferred-off').should('be.visible'));
            SparqlSteps.executeQuery();

            // Verify that there are 1,839 results
            cy.verifyResultsMessage('1,000 of 1,839');
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

            cy.waitUntilQueryIsVisible();
            cy.pasteQuery(updateToExecute);
            SparqlSteps.executeQuery();
            getUpdateMessage()
                .should('be.visible')
                .and('contain', 'Added 1 statements');

            // Should be enabled by default
            getSameAsButton()
                .find('.icon-sameas-on')
                .should('be.visible');

            cy.pasteQuery(selectQuery);
            SparqlSteps.executeQuery();
            verifyResultsPageLength(2);

            getSameAsButton()
                .click()
                .find('.icon-sameas-off')
                .should('be.visible');

            SparqlSteps.executeQuery();
            verifyResultsPageLength(1);
        });
    });

    context('SPARQL view & download', () => {
        beforeEach(() => {
            repositoryId = 'sparql-' + Date.now();
            SparqlSteps.createRepoAndVisit(repositoryId)
        });

        it('Test open a new tab', () => {
            getNewTabButton().click();

            // Verify that as result of clicking addNewTab button we've opened one more tab
            SparqlSteps.getTabs().should('have.length', 2);

            getLastTab()
                .should('have.class', 'active')
                .find('.nav-link')
                .should('have.text', 'Unnamed');

            verifyQueryAreaContains(DEFAULT_QUERY);

            // No queries for new tab
            SparqlSteps.getNoQueryRunInfo().should('be.visible');
        });

        it('Test rename a tab', () => {
            let firstTabName = 'Select query';
            let secondTabName = 'Update query';

            renameTab(1, firstTabName);

            // Still one after renaming
            SparqlSteps.getTabs().should('have.length', 1);

            addTab();

            renameTab(2, secondTabName);

            // TODO: Add spec/steps for cancelling rename

            // Still two after renaming
            SparqlSteps.getTabs().should('have.length', 2);
            verifyTabName(1, firstTabName);
            verifyTabName(2, secondTabName);

            // Go to a different workbench section and then back
            ImportSteps.visitUserImport();

            cy.visit("/sparql");
            SparqlSteps.waitUntilSparqlPageIsLoaded();

            // Still two after navigation
            SparqlSteps.getTabs().should('have.length', 2);
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

            SparqlSteps.getTabs().should('have.length', 2);

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

            SparqlSteps.getTabs().should('have.length', 1);
            verifyTabName(1, 'Tab 3');
        });

        it('Test download query results in Supported formats', () => {
            SparqlSteps.executeQuery();

            // Wait until results are visible before verifying the download menu
            SparqlSteps.getResultsWrapper().should('be.visible');
            verifyResultsPageLength(70);

            openDownloadAsMenu();

            getDownloadAsFormatButtons()
                .should('have.length', 8);

            verifyDownloadMenuFormat('JSON', 'application/sparql-results+json');
            verifyDownloadMenuFormat('XML', 'application/sparql-results+xml');
            verifyDownloadMenuFormat('CSV', 'text/csv');
            verifyDownloadMenuFormat('TSV', 'text/tab-separated-values');
            verifyDownloadMenuFormat('Binary RDF Results', 'application/x-binary-rdf-results-table');
        });

        it('Test switch result format tabs', () => {
            SparqlSteps.executeQuery();

            openRawResponse();
            SparqlSteps.getResultsWrapper()
                .find('.CodeMirror-code')
                .should('be.visible');

            openPivotTable();
            SparqlSteps.getResultsWrapper()
                .find('.pivotTable table.pvtUi')
                .should('be.visible');

            // GCharts blows sometimes and breaks the test
            disableExceptions();

            openGoogleChart();
            SparqlSteps.getResultsWrapper()
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
            SparqlSteps.executeQuery();
            // Verify that all results are properly scaled/displayed
            verifyResultsPageLength(70);

            // Return the orientation to horizontal
            changeViewOrientation();

            cy.get('#sparql-content > div').should('have.class', 'row');
            cy.get(YASR_SELECTOR).should('not.have.class', 'vertical');
        });
    });

    context('Saved queries & links', () => {
        beforeEach(() => {
            repositoryId = 'sparql-' + Date.now();
            SparqlSteps.createRepoAndVisit(repositoryId)
        });

        const QUERY_FOR_SAVING = 'select (count (*) as ?cnt)\n' +
            'where {\n' +
            '    ?s ?p ?o .\n' +
            '}';

        const QUERY_FOR_SAVING_MODIFIED = 'select (count (*) as ?cnt)\n' +
            'where {\n' +
            '    ?s1 ?p1 ?o1 .\n' +
            '}';

        function waitUntilSavedQueryModalIsVisible() {
            getModal().should('not.have.class', 'ng-animate').and('be.visible');
            getSavedQueryForm().should('be.visible');
            getSubmitSavedQueryBtn()
                .should('be.visible')
                .and('not.be.disabled');
        }

        it('Test create, edit and delete saved query', {
            retries: {
                runMode: 1,
                openMode: 0
            }
        }, () => {
            let savedQueryName = 'Saved query - ' + Date.now();

            cy.waitUntilQueryIsVisible();
            cy.pasteQuery(QUERY_FOR_SAVING);

            saveQuery();
            waitUntilSavedQueryModalIsVisible();

            getSavedQueryNameField()
                .type(savedQueryName)
                .should('have.value', savedQueryName);
            submitSavedQuery();

            getSavedQueryForm().should('not.exist');

            // Verify that the query is saved
            SparqlSteps.openSavedQueriesPopup();
            SparqlSteps.getPopover()
                .should('be.visible')
                .and('contain', savedQueryName);

            // Press the pen icon to edit the custom query created earlier
            executeSavedQueryCommand(savedQueryName, EDIT_SAVED_QUERY_COMMAND);

            // Note that popover fades away, which in newer versions of cypress
            // is considered that does not exist. All other checks will fail
            cy.get('.popover').should('not.exist');
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
            SparqlSteps.openSavedQueriesPopup();
            SparqlSteps.getPopover()
                .should('be.visible')
                .and('contain', savedQueryName);

            executeSavedQueryCommand(savedQueryName, EDIT_SAVED_QUERY_COMMAND);

            waitUntilSavedQueryModalIsVisible();

            getSavedQueryNameField().should('have.value', savedQueryName);
            getSavedQueryField().should('have.value', QUERY_FOR_SAVING_MODIFIED);

            // Close edit saved query dialog
            submitSavedQuery();

            // Click on the saved queries icon
            SparqlSteps.openSavedQueriesPopup();
            SparqlSteps.getPopover()
                .should('be.visible')
                .and('contain', savedQueryName);

            // Press the trash bin to delete the custom query created earlier
            executeSavedQueryCommand(savedQueryName, DELETE_SAVED_QUERY_COMMAND);

            // Confirm dialog
            confirmModal();
            getModal().should('not.exist');
            cy.get('.popover').should('not.exist');

            // Verify that the query is deleted
            SparqlSteps.openSavedQueriesPopup();
            SparqlSteps.getPopover()
                .should('be.visible')
                .and('not.contain', savedQueryName);
        });

        it('Test save invalid Sample Queries', () => {
            // Try to save Sample Queries without specifying query name
            saveQuery().then(() => waitUntilSavedQueryModalIsVisible());

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
                .should('not.exist')
            waitUntilSavedQueryModalIsVisible();

            getSavedQueryErrors()
                .find('.query-exists-error')
                .should('be.visible')
                .and('contain', 'Query with name \'Add statements\' already exists!');
        });

        it('Test run saved queries', () => {
            // Execute all default saved queries

            // Execute the default sample Add Statements
            SparqlSteps.selectSavedQuery('Add statements');
            SparqlSteps.getTabs().should('have.length', 2);
            getActiveTabLink().should('have.text', 'Add statements');
            SparqlSteps.getQueryArea().should('contain', 'INSERT DATA');
            SparqlSteps.executeQuery();
            // Verify query information: “Added 2 statements”
            getUpdateMessage()
                .should('contain', 'Added 2 statements.')
                .and('contain', 'Update took');

            // Execute the default sample Remove statements
            SparqlSteps.selectSavedQuery('Remove statements');
            SparqlSteps.getTabs().should('have.length', 3);
            getActiveTabLink().should('have.text', 'Remove statements');
            SparqlSteps.getQueryArea().should('contain', 'DELETE DATA');
            SparqlSteps.executeQuery();
            getUpdateMessage()
                .should('contain', 'Removed 2 statements.')
                .and('contain', 'Update took');

            // Execute the default sample Clear Graph
            SparqlSteps.selectSavedQuery('Clear graph');
            SparqlSteps.getTabs().should('have.length', 4);
            getActiveTabLink().should('have.text', 'Clear graph');
            SparqlSteps.getQueryArea().should('contain', 'CLEAR GRAPH');
            SparqlSteps.executeQuery();
            getUpdateMessage()
                .should('contain', 'The number of statements did not change.')
                .and('contain', 'Update took');

            // Execute the default SPARQL Select template
            SparqlSteps.selectSavedQuery('SPARQL Select template');
            SparqlSteps.getTabs().should('have.length', 5);
            getActiveTabLink().should('have.text', 'SPARQL Select template');
            SparqlSteps.getQueryArea().should('contain', 'SELECT');
            SparqlSteps.executeQuery();
            getUpdateMessage().should('not.be.visible');
            cy.verifyResultsMessage('Showing results from 1 to 74 of 74');
            cy.verifyResultsMessage('Query took');

            verifyResultsPageLength(74);
        });

        it('Test saved query link', () => {
            const queryName = 'Add statements';
            SparqlSteps.openSavedQueriesPopup();
            SparqlSteps.getPopover().should('be.visible');

            executeSavedQueryCommand(queryName, OPEN_SAVED_QUERY_COMMAND);

            const expectedUrl = Cypress.config().baseUrl + '/sparql?savedQueryName=' + encodeURI(queryName) + '&owner=admin';
            getModal()
                .should('be.visible')
                .and('not.have.class', 'ng-animate')
                .find('#clipboardURI')
                .should('have.value', expectedUrl);

            // Visit performs full page load
            cy.visit(expectedUrl);
            SparqlSteps.waitUntilSparqlPageIsLoaded();

            SparqlSteps.getTabs().should('have.length', 2);
            getActiveTabLink().should('have.text', queryName);

            // Wait until editor is initialized with the query and then assert the whole query
            SparqlSteps.getQueryArea().should('contain', 'INSERT DATA');
            cy.fixture('queries/add-statement.txt').then((query) => {
                // Convert new line symbols to \n regardless of OS. Query in SPARQL editor uses \n for new line.
                const EOLregex = /(\r\n|\r|\n)/g;
                const reformattedQuery = query.replace(EOLregex, '\n');
                verifyQueryAreaEquals(reformattedQuery);
            });
        });

        it('Test URL to current query', () => {
            const query = 'SELECT ?sub ?pred ?obj WHERE {?sub ?pred ?obj .} LIMIT 100';
            cy.waitUntilQueryIsVisible();
            cy.pasteQuery(query);

            // Press the link icon to generate a link for a query
            getQueryLinkBtn().click();

            // TODO: Test with tab name -> should open such tab if it was deleted

            // TODO: Test with different values for infer & same as

            const encodedQuery = 'SELECT%20%3Fsub%20%3Fpred%20%3Fobj%20WHERE%20%7B%3Fsub%20%3Fpred%20%3Fobj%20.%7D%20LIMIT%20100';
            const expectedUrl = Cypress.config().baseUrl + '/sparql?name=&infer=true&sameAs=true&query=' + encodedQuery;
            getModal()
                .should('be.visible')
                .and('not.have.class', 'ng-animate')
                .find('#clipboardURI')
                .should('have.value', expectedUrl);

            // Visit performs full page load
            cy.visit(expectedUrl);
            SparqlSteps.waitUntilSparqlPageIsLoaded();
            SparqlSteps.getTabs().should('have.length', 1);

            // Wait until editor is initialized with the query and then assert the whole query
            SparqlSteps.getQueryArea().should('contain', 'SELECT');
            verifyQueryAreaEquals(query);
        });
    });

    context('SPARQL with autocomplete', () => {
        const queryBegin = 'select * where { ';
        const queryEnd = ' ?s ?p . } limit 100';
        const wineUri = '<http://www.w3.org/TR/2003/PR-owl-guide-20031209/wine#CorbansDryWhiteRiesling>';

        it('should suggest resources in the "SPARQL" editor when autocomplete is enabled', () => {
            repositoryId = 'sparql-' + Date.now();
            SparqlSteps.createRepository(repositoryId);

            cy.importServerFile(repositoryId, FILE_TO_IMPORT);

            cy.enableAutocomplete(repositoryId);
            SparqlSteps.visitSparql(true, repositoryId);

            const expectedQuery = queryBegin + wineUri + queryEnd;

            SparqlSteps.clearQuery();

            SparqlSteps.typeQuery(queryBegin, false);
            // TODO: Need to test Alt-Enter too
            SparqlSteps.typeQuery('Dry' + Cypress.env('modifierKey') + ' ', false, true);

            getAutoSuggestHints()
                .should('be.visible')
                .and('have.length', 7)
                .contains('CorbansDryWhiteRiesling')
                .click()
                .should('not.exist');

            SparqlSteps.typeQuery(queryEnd, false);

            verifyQueryAreaEquals(expectedQuery);

            SparqlSteps.executeQuery();

            SparqlSteps.getResultsWrapper().should('be.visible');

            verifyResultsPageLength(10);
        });

        it('should not suggests resources in the "SPARQL" editor if the autocomplete is NOT enabled', () => {
            repositoryId = 'sparql-' + Date.now();
            SparqlSteps.createRepoAndVisit(repositoryId);

            SparqlSteps.clearQuery();

            SparqlSteps.typeQuery(queryBegin, false);
            // TODO: Need to test Alt-Enter too
            SparqlSteps.typeQuery('Dry' + Cypress.env('modifierKey') + ' ', false, true);

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

    function verifyResultsPageLength(resultLength) {
        SparqlSteps.getTableResultRows()
            .should('have.length', resultLength);
    }

    function getResultPagination() {
        return cy.get('#yasr .nav.pagination');
    }

    function getResultPages() {
        // We added prev/next links so only get the li created for actual pages
        return getResultPagination().find('li[ng-repeat]');
    }

    function getModal() {
        return cy.get('.modal');
    }

    function confirmModal() {
        getModal()
            .should('be.visible')
            .and('not.have.class', 'ng-animate')
            .find('.modal-footer')
            .should('be.visible')
            .find('.btn-primary')
            .click();
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
        return SparqlSteps.getTabs().last();
    }

    function renameTab(position, newName) {
        SparqlSteps.getTabs().eq(position - 1).then(tab => {
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
        SparqlSteps.getTabs().eq(position - 1)
            .should('be.visible')
            .find('.nav-link')
            .should('have.text', name);
    }

    function getTabCloseBtn(position) {
        return SparqlSteps.getTabs().eq(position - 1).find('.delete-sparql-tab-btn');
    }

    function closeTab(position) {
        getTabCloseBtn(position).click();
    }

    function verifyQueryAreaContains(query) {
        // Using the CodeMirror instance because getting the value from the DOM is very cumbersome
        cy.waitUntil(() =>
            SparqlSteps.getQueryArea()
                .then(codeMirrorEl => codeMirrorEl && codeMirrorEl[0].CodeMirror.getValue().includes(query)));
    }

    function verifyQueryAreaEquals(query) {
        // Using the CodeMirror instance because getting the value from the DOM is very cumbersome
        SparqlSteps.getQueryArea().should(codeMirrorEl => {
            const cm = codeMirrorEl[0].CodeMirror;
            expect(cm.getValue().trim()).to.equal(query.trim());
        });
    }

    function goToPage(page) {
        getResultPages().contains(page).click();
        SparqlSteps.getLoader().should('not.exist');
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
        return getSaveQueryBtn().click();
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

    function executeSavedQueryCommand(savedQueryName, commandSelector) {
        SparqlSteps.getSavedQueryFromPopup(savedQueryName)
            // Current implementation of the saved queries popup always render the action bar next to
            // each query item but it's just hidden with opacity: 0. So IMO it's safe to force it here.
            .trigger('mouseover', {force: true})
            .find('.actions-bar')
            .find(commandSelector)
            .parent('.btn')
            // Cypress sometimes determines the element has 0x0 dimensions...
            .click({force: true});
    }

    function getUpdateMessage() {
        return cy.get('#yasr-inner .alert-info.update-info');
    }

    function getQueryLinkBtn() {
        return cy.get('#wb-sparql-copyToClipboardQuery');
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
        return SparqlSteps.getResultsWrapper().find('.booleanBootResult');
    }

    function getResultsDownloadButton() {
        return getResultsHeader().find('.yasr_downloadIcon');
    }

    function getInferenceButton() {
        return cy.get('#inference').scrollIntoView();
    }

    function getSameAsButton() {
        return cy.get('#sameAs').scrollIntoView();
    }

    function getAutoSuggestHints() {
        return cy.get('.CodeMirror-hints .CodeMirror-hint');
    }

    function getToast() {
        return cy.get('#toast-container');
    }
});
