describe('SPARQL Templates', () => {

    let repositoryId;
    const TEMPLATE_NAME = "http://example.com/salary_template";
    const SPARQL_TEMPLATE = "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
        "PREFIX factory: <http://factory/>\n" +
        "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\n" +
        "PREFIX spif: <http://spinrdf.org/spif#>\n" +
        "INSERT {\n" +
        "?id <http://factory/updatedOn> \"2021-10-01T07:55:38.238Z\"^^xsd:dateTime .\n" +
        "?split spif:split (\"blaaa/blaa\" \"/\")\n" +
        "} WHERE {\n" +
        "?id rdf:type <http://factory/Factory> .\n" +
        "?worker <http://factory/worksIn> ?id .\n" +
        "?worker <http://factory/hasSalary> ?oldSalary .\n" +
        "FILTER regex(STR(?id), \"fac\", \"i\")\n" +
        "?split spif:split (\"blaaa/blaa\" \"/\")\n" +
        "bind(now() as ?now)\n" +
        "}";
    const DEFAULT_QUERY = "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
        "PREFIX ex: <http://example.com#>\n" +
        "DELETE {\n" +
        "  ?subject ex:myPredicate ?oldValue .\n" +
        "} INSERT {\n" +
        "  ?subject ex:myPredicate ?newValue .\n" +
        "} WHERE {\n" +
        "  ?id rdf:type ex:MyType .\n" +
        "  ?subject ex:isRelatedTo ?id .\n" +
        "}\n";

    before(() => {
        repositoryId = 'sparql-templates-repo' + Date.now();
        cy.createRepository({id: repositoryId});
    });

    beforeEach(() => {
        cy.visit('/sparql-templates', {
            onBeforeLoad: (win) => {
                win.localStorage.setItem('com.ontotext.graphdb.repository', repositoryId);
            }
        });
        cy.window()
            .then(() => getTemplatesTable().scrollIntoView().should('be.visible'));
    });

    after(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Initial state', () => {
        cy.url().should('include', '/sparql-templates');
        //Verify templates table is empty
        getTemplatesTable().should('be.visible')
            .and('contain','No templates are defined');
        //Verify create template button is visible
        getCreateSparqlTemplateButton().should('be.visible');
    });

    it('Should create/edit/delete a SPARQL template', () => {
        //Click create template button
        getCreateSparqlTemplateButton().click();
        cy.waitUntilQueryIsVisible();
        //Test Template IRI field validation
        getSaveButton().click();
        //Verify error toast
        getToastError()
            .should('be.visible')
            .and('contain','SPARQL template IRI is required');
        //Type a valid Template IRI value in the filed
        getTemplateNameField().type(TEMPLATE_NAME);
        //Verify default query
        verifyQueryAreaEquals(DEFAULT_QUERY);
        clearQuery();
        //Paste new template query and verify content
        cy.pasteQuery(SPARQL_TEMPLATE);
        verifyQueryAreaEquals(SPARQL_TEMPLATE);
        getSaveButton()
            .scrollIntoView()
            .click()
            .then(() => {
                cy.waitUntil(() =>
                    cy.get('.edit-query-btn')
                        .then(editBtn => editBtn));
            });
        //Verify new template is stored in the templates table
        getTemplatesTable().should('be.visible')
            .and('contain',TEMPLATE_NAME);
        //Edit template
        getEditTemplateButton(TEMPLATE_NAME);
        cy.waitUntilQueryIsVisible();
        verifyQueryAreaEquals(SPARQL_TEMPLATE);
        clearQuery();
        //Change query to the default template again
        cy.pasteQuery(DEFAULT_QUERY);
        verifyQueryAreaEquals(DEFAULT_QUERY);
        getSaveButton().click();
        //Verify change to default template is persisted
        getEditTemplateButton(TEMPLATE_NAME);
        cy.waitUntilQueryIsVisible();
        verifyQueryAreaEquals(DEFAULT_QUERY);
        //Cancel as no changes have been made
        getCancelButton().click();
        //Delete template and verify templates table is empty
        getDeleteTemplateButton(TEMPLATE_NAME);
        getConfirmDeleteTemplateButton().click();
        cy.url().should('include', '/sparql-templates');
        getTemplatesTable().should('be.visible')
            .and('contain','No templates are defined');
    });

    function getTemplatesTable() {
        return cy.get('.sparql-templates-list');
    }

    function getCreateSparqlTemplateButton() {
        return cy.get('.clearfix .create-sql-table-configuration');
    }

    function getTemplateNameField() {
        return cy.get('.sparql-template-name');
    }

    function verifyQueryAreaEquals(query) {
        // Using the CodeMirror instance because getting the value from the DOM is very cumbersome
        getQueryArea().should(codeMirrorEl => {
            const cm = codeMirrorEl[0].CodeMirror;
            expect(cm.getValue().trim()).to.equal(query.trim());
        });
    }

    function getQueryArea() {
        return cy.get('#queryEditor .CodeMirror');
    }

    function clearQuery() {
        // Using force because the textarea is not visible
        getQueryTextArea().type(Cypress.env('modifierKey') + 'a{backspace}', {force: true});
    }

    function getQueryTextArea() {
        return getQueryArea().find('textarea');
    }

    function getSaveButton() {
        return cy.get('.save-query-btn');
    }

    function getCancelButton() {
        return cy.get('.cancel-query-btn');
    }

    function getToastError() {
        return cy.get('#toast-container');
    }

    function getEditTemplateButton(templateName) {
        return cy.get('#configurations-table tr')
            .contains(templateName)
            .parent()
            .parent()
            .within(() => {
            cy.get('.icon-edit').click();
        })
    }

    function getDeleteTemplateButton(templateName) {
        return cy.get('#configurations-table tr')
            .contains(templateName)
            .parent()
            .parent()
            .within(() => {
                cy.get('.icon-trash').click();
            })
    }

    function getConfirmDeleteTemplateButton() {
        return cy.get('.confirm-btn');
    }
});
