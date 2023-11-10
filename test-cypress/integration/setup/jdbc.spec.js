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
    "}  ";
const EDIT_QUERY = "PREFIX ex:<http://example.com/#>\n" +
    "PREFIX base:<http://example/base/>\n" +
    "PREFIX rdfs:<http://www.w3.org/2000/01/rdf-schema#>\n" +
    "PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
    "PREFIX foaf: <http://xmlns.com/foaf/0.1/>\n" +
    "\n" +
    "select ?id ?fraud_score ?customer_loyalty where { \n" +
    "\t?id rdf:type ex:Customer;\n" +
    "      \tex:fraudScore ?fraud_score;\n" +
    "       \tex:customerLoyalty ?customer_loyalty_id.\n" +
    "    ?customer_loyalty_id rdfs:label ?customer_loyalty.\n" +
    "    # !filter\n" +
    "}  ";

describe('JDBC configuration', () => {

    let repositoryId;

    beforeEach(() => {
        repositoryId = 'jdbc-repo-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        cy.importServerFile(repositoryId, FILE_TO_IMPORT);
        cy.visit('/jdbc');
        cy.window();
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Configuration table preview', () => {
        // SQL configuration table should be visible
        getConfigurationList().should('be.visible');
    });

    it('Should create a new JDBC configuration, edit, preview, then delete', () => {
        getCreateNewJDBCConfigurationButon().click();
        cy.pasteQuery(QUERY);
        getJDBCConfigNameField().type(JDBC_CONFIG_NAME);

        // switch to SQL columns config tab
        getColumnTypesTab().click();
        // verify columns length and content
        getSQLTableRows().should('have.length', 4);
        getSQLTableConfig()
            .should('be.visible')
            .and('contain', 'sentiment_score');

        getSaveButton().click();
        // verify config is created
        getConfigurationList().should('contain', JDBC_CONFIG_NAME);
        getEditButton().click();
        // used to verify that the input field is active
        typeQuery("{downarrow}");

        getPreviewButton().click();
        getLoader().should('not.exist');

        // verify results content
        getPreviewTable()
            .should('be.visible')
            .and('contain', 'SENTIMENT_SCORE')
            .and('contain', 'CUSTOMER_LOYALTY')
            .and('contain', 'ID')
            .and('contain', 'FRAUD_SCORE');

        // clear current query and paste the edited one, to test the suggest functionality
        clearQuery();
        cy.pasteQuery(EDIT_QUERY);
        getColumnTypesTab().click();
        // click suggest button to update the changes from the second query
        getSuggestButton().click();
        getConfirmSuggestButton().click();
        // verify columns length and content
        getSQLTableRows().should('have.length', 3);
        getSQLTableConfig()
            .should('be.visible')
            .and('not.contain', 'sentiment_score');
        getSaveButton().click();

        getEditButton().click();
        // Verify that changes have been applied upon saving
        // used to verify that the input field is active
        typeQuery("{downarrow}");
        getPreviewButton().click();
        getLoader().should('not.exist');

        // verify results content
        getPreviewTable()
            .should('be.visible')
            .and('contain', 'ID')
            .and('contain', 'FRAUD_SCORE')
            .and('contain', 'CUSTOMER_LOYALTY');

        getCancelButton().click();
        // Delete jdbc configuration
        cy.get('.jdbc-list-configurations').should('be.visible');
        getDeleteButton().click();
        getConfirmDialogButton().click();
        getConfigurationList().should('contain', 'No tables are defined');
    });
});

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

function typeQuery(query) {
    // getQueryTextArea().invoke('val', query).trigger('change', {force: true});
    getQueryTextArea().type(query, {force: true});
    cy.waitUntilQueryIsVisible();
}

function clearQuery() {
    // Using force because the textarea is not visible
    getQueryTextArea().type(Cypress.env('modifierKey') + 'a{backspace}', {force: true});
}

function getColumnTypesTab() {
    return cy.get('.nav-tabs').contains("Column types");
}

function getDataQueryTab() {
    return cy.get('.nav-tabs').contains("Data query");
}

function getSaveButton() {
    return cy.get('.save-query-btn');
}

function getDeleteButton() {
    return cy.get('.icon-trash');
}

function getCancelButton() {
    return cy.get('.cancel-query-btn');
}

function getConfirmDialogButton() {
    return cy.get('.btn-primary');
}

function getConfigurationList() {
    return cy.get('.jdbc-list-configurations');
}

function getEditButton() {
    return cy.get('.icon-edit');
}

function getSQLTableRows() {
    return cy.get('div.form-group.row.pt-1.ng-scope');
}

function getPreviewButton() {
    return cy.get('.preview-btn');
}

function getSuggestButton() {
    return cy.get('.sql-table-config .preview-btn');
}

function getConfirmSuggestButton() {
    return cy.get('.confirm-btn');
}

function getLoader() {
    return cy.get('.ot-loader-new-content');
}

function getPreviewTable() {
    return cy.get('.resultsTable');
}

function getSQLTableConfig() {
    return cy.get('.sql-table-config');
}
