export class SparqlTemplatesSteps {

    static visit() {
        cy.visit('/sparql-templates');
    }

    static verifyUrl() {
        cy.url().should('include', '/sparql-templates');
    }

    static getSparqlTemplatesListContainer() {
        return cy.get('.sparql-templates-list');
    }

    static getCreateSparqlTemplateButton() {
        return cy.get('.create-sparql-template');
    }

    static clickOnCreateSparqlTemplateButton () {
        SparqlTemplatesSteps.getCreateSparqlTemplateButton().realClick();
    }

    static getSparqlTemplates() {
        return cy.get('#configurations-table tr');
    }

    static getSparqlTemplate(templateName) {
        return SparqlTemplatesSteps.getSparqlTemplates().contains(templateName);
    }

    static deleteTemplate(templateName) {
        SparqlTemplatesSteps.getSparqlTemplate(templateName).parents('tr').find('.delete-configuration-btn').click();
    }

    static getNoTemplateDefinedElement() {
        return cy.get('.no-indexes');
    }
}
