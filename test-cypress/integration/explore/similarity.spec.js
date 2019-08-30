import ImportSteps from '../../steps/import-steps';

describe('Similarity screen validation', () => {

    const INDEX_NAME = 'index-' + Date.now();
    const FILE_TO_IMPORT = 'people.zip';
    const SUCCESS_MESSAGE = 'Imported successfully';
    const INDEX_CREATE_URL = '/similarity/index/create';
    const BUILD_PARAM = ' -trainingcycles 4';
    const STOP_WORD = 'stopword';
    const LUCENE_ANALYZER = 'org.apache.lucene.analysis.de.GermanAnalyzer';

    let repositoryId;

    beforeEach(() => {
        repositoryId = 'repo-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepositoryCookie(repositoryId);

        ImportSteps.visitServerImport();
        ImportSteps.selectServerFile(FILE_TO_IMPORT)
            .importServerFiles()
            .verifyImportStatus(FILE_TO_IMPORT, SUCCESS_MESSAGE);

        cy.visit('/similarity');
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Test similarity page default state', () => {
        checkSimilarityPageDefaultState();
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

    function checkSimilarityPageDefaultState() {
        //TODO: Should change the 'contain' method to 'eq' once GDB-3699 is fixed.
        cy.url().should('contain', Cypress.config('baseUrl') + '/similarity');
        getExistingIndexesPanel().should('be.visible').and('contain', 'No Indexes');
    }

    function openCreateNewIndexForm() {
        cy.get('.create-similarity-index').click();
    }

    function setIndexName() {
        cy.url().should('eq', Cypress.config('baseUrl') + INDEX_CREATE_URL);
        cy.get('.similarity-index-name').type(INDEX_NAME);
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
        cy.get('.analyzer-class').type('{ctrl}a{backspace}', {force: true})
            .invoke('val', LUCENE_ANALYZER).trigger('change', {force: true});
    }

    function checkLiteralIndex() {
        cy.get('.literal-index').click();
    }

    function createSimilarityIndex() {
        getCreateIndexButton().click();
        getExistingIndexesPanel().should('be.visible');
        cy.get('#indexes-table table').should('be.visible')
            .find('.index-row').should('have.length', 1);
        // Just wait for the row in the table to appear and the cell with the index name to be
        // visible. Waiting for the loading indicator to disappear is just too brittle.
        // Also trying to check for the index name in the cell with `.and('contain', INDEX_NAME);`
        // fails often because during completing the index name on a previous step the WB seems to
        // cut off part of the name on the leading side.
        cy.get(`#indexes-table .index-name`).should('be.visible');
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
    }

    function cloneExistingIndex() {
        cy.url().should('eq', Cypress.config('baseUrl') + '/similarity');
        cy.get('.clone-index-btn').click();

        // This is just an implicit wait in order to allow the view to catch up with the rendering
        // before trying to click the button. Its needed because the button doesn't always accept
        // the click most likely due to some async behavior
        cy.contains('Sample queries:').next('.list-group').should('be.visible');
        getCreateIndexButton().should('be.visible').click();
        getExistingIndexesPanel().should('be.visible');
        waitForIndexBuildingIndicatorToHide();
        cy.get(`#indexes-table .index-name`).should('have.length', 2);

        cy.url().should('contain', Cypress.config('baseUrl') + '/similarity'); //Should change the 'contain' method to 'eq' once GDB-3699 is resolved
    }

    function rebuildIndex() {
        // Explicitly increased timeout because index creation takes more time.
        cy.get('.similarity-index-icon-reload', {timeout: 20000}).should('be.visible').click();
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

    function changeDataQuery() {
        const MODIFIED_DATA_QUERY = 'SELECT ?documentID ?documentText { \n' +
            '?documentID <http://dbpedia.org/ontology/birthDate> ?documentText . \n' +
            'filter(isLiteral(?documentText)) \n' +
            '}order by asc(str(?documentID))';

        setNewQuery(MODIFIED_DATA_QUERY);
        cy.get('.test-query-btn').click();
        cy.get('.sparql-loader').should('not.be.visible');
        cy.get('.resultsTable', {timeout: 10000}).should('be.visible').find('tbody tr').its('length').should('be.gt', 1);
        cy.get('.uri-cell').eq(0).should('contain', 'http://dbpedia.org/resource/Aaron_Jay_Kernis');
    }

    function changeSearchQuery() {
        const MODIFIED_SEARCH_QUERY = 'PREFIX :<http://www.ontotext.com/graphdb/similarity/> \n' +
            'SELECT ?documentID ?score { \n' +
            '?search a ?index ; \n' +
            '?searchType ?query; \n' +
            ':searchParameters ?parameters; \n' +
            '?resultType ?result . \n' +
            '?result :value ?documentID ; \n' +
            ':score ?score. \n' +
            'OPTIONAL { ?result <http://dbpedia.org/ontology/birthPlace> ?birthDate . }}';

        cy.get('.search-query-tab').click();
        setNewQuery(MODIFIED_SEARCH_QUERY);
    }

    function getDeleteIndexButton() {
        return cy.get('.delete-index-btn');
    }

    function getCreateIndexButton() {
        return cy.get('.create-similarity-index-btn');
    }

    function getExistingIndexesPanel() {
        return cy.get('.existing-indexes');
    }

    function waitForIndexBuildingIndicatorToHide() {
        // Timeout is explicitly increased because index creation/rebuilding takes longer than default timeout.
        cy.get('.similarity-index-building-loader', {timeout: 30000}).should('not.be.visible');
    }

    function setNewQuery(newQuery) {
        // delete default search query and put a new one
        // forced because the textarea in codemirror is not visible
        cy.get('.CodeMirror textarea').type('{ctrl}a{backspace}', {force: true});
        cy.get('.CodeMirror textarea').invoke('val', newQuery).trigger('change', {force: true});
        cy.get('.CodeMirror').should(codeMirrorEl => {
            const cm = codeMirrorEl[0].CodeMirror;
            expect(cm.getValue().trim().length > 0).to.be.true;
        });
    }
});
