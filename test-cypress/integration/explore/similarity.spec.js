const INDEX_NAME = 'index-' + Date.now();
const FILE_TO_IMPORT = 'people.zip';
const INDEX_CREATE_URL = '/similarity/index/create';
const BUILD_PARAM = ' -trainingcycles 4';
const STOP_WORD = 'stopword';
const LUCENE_ANALYZER = 'org.apache.lucene.analysis.de.GermanAnalyzer';
const MODIFIED_SEARCH_QUERY = 'PREFIX :<http://www.ontotext.com/graphdb/similarity/> \n' +
    'SELECT ?documentID ?score { \n' +
    '?search a ?index ; \n' +
    '?searchType ?query; \n' +
    ':searchParameters ?parameters; \n' +
    '?resultType ?result . \n' +
    '?result :value ?documentID ; \n' +
    ':score ?score. \n' +
    'OPTIONAL { ?result <http://dbpedia.org/ontology/birthPlace> ?birthDate . }}';
const MODIFIED_ANALOGICAL_QUERY = 'PREFIX :<http://www.ontotext.com/graphdb/similarity/>\n' +
    'PREFIX psi:<http://www.ontotext.com/graphdb/similarity/psi/>\n' +
    'PREFIX inst:<http://www.ontotext.com/graphdb/similarity/instance/>\n' +
    '\n' +
    'SELECT ?resultValue ?score {\n' +
    '    ?search a ?index ;\n' +
    '        psi:givenSubject ?givenSubject;\n' +
    '        psi:givenObject ?givenObject;\n' +
    '        psi:searchSubject ?searchSubject;\n' +
    '        :searchParameters ?parameters;\n' +
    '        psi:resultObject ?result .\n' +
    '    ?result :value ?resultValue;\n' +
    '            :score ?score .\n' +
    'OPTIONAL { ?result <http://dbpedia.org/ontology/birthPlace> ?birthDate . }}';

describe('Similarity screen validation', () => {

    let repositoryId;

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Test similarity page default state', () => {
        initRepositoryAndVisitSimilarityView();
        checkSimilarityPageDefaultState();
    });

    context('Creating similarity index', () => {
        beforeEach(() => {
            initRepositoryAndVisitSimilarityView()
        });

        it('Create default text similarity index and view SPARQL query', () => {
            openCreateNewIndexForm();
            setIndexName();
            createSimilarityIndex();
            viewSPARQLQuery();
            deleteSimilarityIndex();
        });

        it('Create default predication similarity index', () => {
            openCreateNewIndexForm();
            switchToPredicationIndex();
            setIndexName();
            createSimilarityIndex();
        });

        it('Create text similarity index with a build parameter, stop word and custom Lucene Analyzer', () => {
            openCreateNewIndexForm();
            setIndexName();
            clickMoreOptionsMenu();
            addBuildParam();
            addStopWord();
            addLuceneAnalyzer();
            clickMoreOptionsMenu();
            createSimilarityIndex();
        });

        it('Create predication similarity index with a build parameter', () => {
            openCreateNewIndexForm();
            switchToPredicationIndex();
            setIndexName();
            clickMoreOptionsMenu();
            addBuildParam();
            clickMoreOptionsMenu();
            createSimilarityIndex();
        });

        it('Create text similarity - literal index', () => {
            openCreateNewIndexForm();
            setIndexName();
            clickMoreOptionsMenu();
            checkLiteralIndex();
            createSimilarityIndex();
        });
    });

    context('Index operations', () => {
        beforeEach(() => {
            initRepositoryAndVisitSimilarityView()
        });

        it('Change Data query in Create index', () => {
            openCreateNewIndexForm();
            setIndexName();
            changeDataQuery();
            createSimilarityIndex();
        });

        it('Change Search query in Create index', () => {
            openCreateNewIndexForm();
            setIndexName();
            changeSearchQuery();
            createSimilarityIndex();
        });

        it('Change Search query of existing text index', () => {
            openCreateNewIndexForm();
            setIndexName();
            createSimilarityIndex();
            openEditQueryView();
            changeSearchQuery();
            getSaveEditedQueryButton().click();
            openEditQueryView();
            verifyQueryIsChanged();
        });

        it('Change Analogical query of existing predication index', () => {
            openCreateNewIndexForm();
            switchToPredicationIndex();
            setIndexName();
            createSimilarityIndex();
            openEditQueryView(true);
            changeAnalogicalQuery();
            getSaveEditedQueryButton().click();
            openEditQueryView(true);
            getAnalogicalQueryTab().click();
            verifyQueryIsChanged();
        });

        it('Clone existing similarity index', () => {
            openCreateNewIndexForm();
            setIndexName();
            createSimilarityIndex();
            cloneExistingIndex();
        });

        it('Rebuild existing similarity index', () => {
            openCreateNewIndexForm();
            setIndexName();
            createSimilarityIndex();
            rebuildIndex();
        });
    });

    context('Searching in index', () => {
        beforeEach(() => {
            initRepositoryAndVisitSimilarityView()
        });

        it('Search for entiry in index', () => {
            // I have created similarity index
            openCreateNewIndexForm();
            setIndexName();
            createSimilarityIndex();
            // wait a bit for the edit icon to ensure index is created
            cy.get('.icon-edit').should('be.visible');

            // When I open the index
            openIndex(0);

            // Then I expect the indexes table to become hidden
            cy.get('#indexes-table table').should('not.be.visible');

            // And index search panel to be opened
            cy.get('.index-search-panel').should('be.visible');
            cy.get('.selected-index').should('be.visible').and('contain', `Search in ${INDEX_NAME}`);
            getSearchIndexInput().should('be.visible');

            // When I search for "Neal" in the index
            searchIndex('Neal');

            // Then I expect search results to be displayed
            cy.get('.search-results').should('be.visible');
            // And showing 20 results
            cy.get('.resultsTable tbody tr').should('have.length', 20);
        });
    });

    it('Disable and enable similarity plugin', () => {
        initRepository();

        cy.visit('/sparql');
        waitUntilSparqlPageIsLoaded();

        // When I disable the plugin.
        disableSimilarityPlugin();

        // Then I expect a message to be displayed confirming that operation is complete.
        cy.get('.update-info.alert-info').should('be.visible').and('contain', 'The number of statements did not change.');

        // When I try to disable it while it's disabled.
        disableSimilarityPlugin();

        // Then I expect an error message to be displayed informing me that the plugin has been already disabled.
        cy.get('.update-info.alert-danger .plaintext').should('be.visible').and('contain', 'Plugin similarity has been already disabled');

        // When I visit similarity view while the plugin is disabled.
        cy.visit('/similarity');

        // Then I expect a message to be displayed informing me that the plugin is disabled.
        cy.get('.plugin-disabled-warning').should('be.visible').and('contain', 'Similarity Plugin is disabled for this repository.');

        // When I enable the plugin
        cy.get('.enable-plugin-link').click();

        // Then I expect default similarity view with no indexes available
        checkSimilarityPageDefaultState();
    });

    function initRepository() {
        repositoryId = 'similarity-repo-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        cy.importServerFile(repositoryId, FILE_TO_IMPORT);
    }

    function initRepositoryAndVisitSimilarityView() {
        initRepository();
        cy.visit('/similarity');
        cy.window();
    }

    function openIndex(index) {
        getIndexLinks().eq(index).click();
    }

    function getSearchIndexInput() {
        // There are 6 such fields and it's not obvious what selectors they should have.
        // So we select it by placeholders.
        return cy.get('input[placeholder="Search RDF resources for RDF entity"]');
    }

    function searchIndex(entity) {
        getSearchIndexInput().type(entity);
        // there are two buttons so we search in the context
        getSearchIndexInput().closest('.input-group').find('.autocomplete-visual-btn').click();
    }

    function disableSimilarityPlugin() {
        const disableSimilarityPluginQuery = 'INSERT DATA { <u:a> <http://www.ontotext.com/owlim/system#stopplugin> \'similarity\' . }';
        cy.pasteQuery(disableSimilarityPluginQuery);
        cy.executeQuery();
    }

    function waitUntilSparqlPageIsLoaded() {
        // Workbench loading screen should not be visible
        cy.get('.ot-splash').should('not.be.visible');

        cy.get('#queryEditor .CodeMirror').should(codeMirrorEl => {
            const cm = codeMirrorEl[0].CodeMirror;
            expect(cm.getValue().trim().length > 0).to.be.true;
        });

        // No active loader
        cy.get('.ot-loader-new-content').should('not.be.visible');
    }

    function checkSimilarityPageDefaultState() {
        //TODO: Should change the 'contain' method to 'eq' once GDB-3699 is fixed.
        cy.url().should('contain', Cypress.config('baseUrl') + '/similarity');
        getExistingIndexesPanel().and('contain', 'No Indexes');
    }

    function openCreateNewIndexForm() {
        cy.get('.create-similarity-index').click();
        cy.url().should('contain', `${Cypress.config('baseUrl')}/similarity/index/create`);
        // Wait for query editor to become ready because consecutive command for index creation might
        // fail because the query may not be submitted with the request.
        cy.waitUntilQueryIsVisible();
    }

    function setIndexName() {
        cy.url().should('eq', Cypress.config('baseUrl') + INDEX_CREATE_URL);
        getSimilarity().invoke('val', INDEX_NAME).trigger('change')
            .then(() => getSimilarity().should('have.value', INDEX_NAME));
    }

    function clickMoreOptionsMenu() {
        cy.get('.more-options-btn').click();
    }

    function addBuildParam() {
        cy.get('#indexParameters').type(BUILD_PARAM);
    }

    function addStopWord() {
        cy.get('.stop-words').type(STOP_WORD);
    }

    function addLuceneAnalyzer() {
        cy.get('.analyzer-class').type(Cypress.env('modifierKey') + 'a{backspace}', {force: true})
            .invoke('val', LUCENE_ANALYZER).trigger('change', {force: true});
    }

    function checkLiteralIndex() {
        cy.get('.literal-index').click();
    }

    function createSimilarityIndex() {
        getCreateIndexButton().click()
            .then(() => {
                cy.url().should('eq', `${Cypress.config('baseUrl')}/similarity`);
                getExistingIndexesPanel();
                cy.get('#indexes-table table').should('be.visible')
                    .find('.index-row').should('have.length', 1);
                // Just wait for the row in the table to appear and the cell with the index name to be
                // visible. Waiting for the loading indicator to disappear is just too brittle.
                // Also trying to check for the index name in the cell with `.and('contain', INDEX_NAME);`
                // fails often because during completing the index name on a previous step the WB seems to
                // cut off part of the name on the leading side.
                getIndexLinks().should('be.visible');
            });
    }

    function deleteSimilarityIndex() {
        waitForIndexBuildingIndicatorToHide();
        getDeleteIndexButton().should('be.visible');
        getDeleteIndexButton().click();
        cy.get('.modal-footer .confirm-btn').click();
        cy.get('.no-indexes').should('be.visible').and('contain', 'No Indexes');
    }

    function switchToPredicationIndex() {
        cy.get('#create-predication-index').click();
        // Wait for query editor to become ready because consecutive command for index creation might
        // fail because the query may not be submitted with the request.
        cy.waitUntilQueryIsVisible();
    }

    function cloneExistingIndex() {
        cy.url().should('eq', Cypress.config('baseUrl') + '/similarity');
        cy.get('.clone-index-btn').click()
            .then(() => cy.url().should('contain', `${Cypress.config('baseUrl')}/similarity/index/create`));

        // This is just an implicit wait in order to allow the view to catch up with the rendering
        // before trying to click the button. Its needed because the button doesn't always accept
        // the click most likely due to some async behavior
        cy.contains('Sample queries:').next('.list-group').should('be.visible');
        getCreateIndexButton().should('be.visible').click();
        // Note that while cloning index there is a small amount of time
        // during which actual URL is /similarity?<and_the_config_appended>
        // we should bypass this going to th
        cy.visit('/similarity');
        cy.window();
        getExistingIndexesPanel();
        waitForIndexBuildingIndicatorToHide();
        cy.get(`#indexes-table .index-name`).should('have.length', 2);

        cy.url().should('contain', Cypress.config('baseUrl') + '/similarity'); //Should change the 'contain' method to 'eq' once GDB-3699 is resolved
    }

    function getIndexLinks() {
        return cy.get('#indexes-table .index-name');
    }

    function rebuildIndex() {
        cy.get('.similarity-index-icon-reload').should('be.visible').click();
        cy.get('.modal-footer .btn-primary').click();
        cy.get('.similarity-index-building-loader').should('be.visible');
        getDeleteIndexButton().should('be.visible');
        waitForIndexBuildingIndicatorToHide();
    }

    function viewSPARQLQuery() {
        cy.get('.view-sparql-query-btn').click();
        cy.get('.modal-title').should('be.visible').and('contain', 'View SPARQL Query');
        cy.get('.btn-primary').should('be.visible').and('contain', 'Copy to clipboard');
        cy.get('.close').click();
        cy.get('.modal').should('not.be.visible');
        cy.get('.modal-backdrop').should('not.be.visible');
    }

    function openEditQueryView(isPredication) {
        cy.url().should('eq', Cypress.config('baseUrl') + '/similarity');
        // Open "Edit search query" view
        cy.get('.edit-query-btn').click();
        // Verify that 'similarity-index-name' input field is disabled
        getSimilarity().should('be.disabled');
        getSearchQueryTab().should('be.visible');
        let shouldAnalogicalTabBeVisible = (isPredication ? '' : 'not.') + 'be.visible';
        getAnalogicalQueryTab().should(shouldAnalogicalTabBeVisible);
    }

    function changeDataQuery() {
        const MODIFIED_DATA_QUERY = 'SELECT ?documentID ?documentText { \n' +
            '?documentID <http://dbpedia.org/ontology/birthDate> ?documentText . \n' +
            'filter(isLiteral(?documentText)) \n' +
            '}order by asc(str(?documentID))';

        cy.pasteQuery(MODIFIED_DATA_QUERY);
        cy.get('.test-query-btn').click();
        cy.get('.sparql-loader').should('not.be.visible');
        cy.get('.resultsTable').should('be.visible').find('tbody tr').its('length').should('be.gt', 1);
        cy.get('.uri-cell').eq(0).should('contain', 'http://dbpedia.org/resource/Aaron_Jay_Kernis');
    }

    function changeSearchQuery() {
        getSearchQueryTab().click();
        cy.pasteQuery(MODIFIED_SEARCH_QUERY);
    }

    function changeAnalogicalQuery() {
        getAnalogicalQueryTab().click();
        cy.pasteQuery(MODIFIED_ANALOGICAL_QUERY);
    }

    function getDeleteIndexButton() {
        return cy.get('.delete-index-btn');
    }

    function getCreateIndexButton() {
        return cy.get('.create-similarity-index-btn');
    }

    function getSearchQueryTab() {
        return cy.get('.search-query-tab');
    }

    function getAnalogicalQueryTab() {
        return cy.get('.analogical-query-tab');
    }

    function getSaveEditedQueryButton() {
        return cy.get('.save-query-btn');
    }

    function getSimilarity() {
        return cy.get('.similarity-index-name');
    }

    function getExistingIndexesPanel() {
        return cy.get('.existing-indexes').should('be.visible');
    }

    function waitForIndexBuildingIndicatorToHide() {
        cy.get('.similarity-index-building-loader').should('not.be.visible');
    }

    function verifyQueryIsChanged() {
        const query = 'OPTIONAL { ?result <http://dbpedia.org/ontology/birthPlace> ?birthDate .';
        cy.verifyQueryAreaContains(query);
    }

    function getToast() {
        return cy.get('#toast-container');
    }
});
