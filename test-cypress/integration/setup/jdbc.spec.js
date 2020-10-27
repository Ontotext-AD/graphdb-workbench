const FILE_TO_IMPORT = '200-row-allianz.ttl';
const JDBC_CONFIG_NAME = 'jdbc_config';
const QUERY = "PREFIX ex:<http://example.com/#>\n" +
    "PREFIX base:<http://example/base/>\n" +
    "PREFIX rdfs:<http://www.w3.org/2000/01/rdf-schema#>\n" +
    "PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
    "PREFIX foaf: <http://xmlns.com/foaf/0.1/>\n" +
    "\n" +
    "select ?id ?sentiment_score ?fraud_score ?customer_loyalty where { \n" +
    "\t?id rdf:type ex:Customer;\n" +
    "    \tex:sentiment ?sentiment_score;\n" +
    "      \tex:fraudScore ?fraud_score;\n" +
    "       \tex:customerLoyalty ?customer_loyalty_id.\n" +
    "    ?customer_loyalty_id rdfs:label ?customer_loyalty.\n" +
    "    # !filter\n" +
    "}  "

describe('JDBC configuration', () => {

    let repositoryId;

    context('No repository selected', () => {
        it('Initial error state', () => {
            cy.visit('/jdbc');
            // Repository not selected warning should be visible
            cy.get('.repository-errors').should('be.visible');
        });
    });

    context('Creating JDBC configuration', () => {
        beforeEach(() => {
            initRepositoryAndVisitJdbcView();
        });

        afterEach(() => {
            cy.deleteRepository(repositoryId);
        });

        it('Configuration table preview', () => {
            //cy.visit('/jdbc');
            // SQL configuration table should be visible
            getConfigurationList().should('be.visible');
        });

        it.only('Should create a new JDBC configuration, then delete', () => {
            getCreateNewJDBCConfigurationButon().click();
            cy.get('.ot-splash').should('not.be.visible');
            cy.get('.CodeMirror-linenumber').should('be.visible').and('be','active');
            cy.wait(500);
            pasteQuery(QUERY);
            getJDBCConfigNameField().type(JDBC_CONFIG_NAME);
            getColumnTypesTab().click();
            getSaveButton().click();
            getConfigurationList().should('contain', JDBC_CONFIG_NAME);
            getDeleteButton().click();
            getConfirmDeleteButton().click();
            getConfigurationList().should('contain', 'No Indexes');
        });
    });

    function initRepositoryAndVisitJdbcView() {
        repositoryId = 'jdbc-repo-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepositoryCookie(repositoryId);
        cy.importServerFile(repositoryId, FILE_TO_IMPORT);
        cy.visit('/jdbc');
    }

    function getCreateNewJDBCConfigurationButon() {
        return cy.get('.create-sql-table-configuration');
    }

    function getJDBCConfigNameField() {
        return cy.get('.sql-table-name');
    }

    function getQueryArea() {
        return cy.get('.CodeMirror');
    }

    function getQueryTextArea() {
        return getQueryArea().find('textarea');
    }

    function pasteQuery(query) {
        getQueryTextArea().invoke('val', query).trigger('change', {force: true});
        waitUntilQueryIsVisible();
    }

    function waitUntilQueryIsVisible() {
        getQueryArea().should(codeMirrorEl => {
            const cm = codeMirrorEl[0].CodeMirror;
            expect(cm.getValue().trim().length > 0).to.be.true;
        });
    }

    function getColumnTypesTab() {
        return cy.get('.nav-tabs').contains("Column types");
    }

    function getSaveButton() {
        return cy.get('.save-query-btn');
    }

    function getDeleteButton() {
        return cy.get('.icon-trash');
    }

    function getConfirmDeleteButton() {
        return cy.get('.btn-primary');
    }

    function getConfigurationList() {
        return cy.get('.jdbc-list-configurations');
    }
});
