export class SparqlCreateUpdateSteps {
    static visit(templateId) {
        cy.visit(`/sparql-template/create${templateId ? '?templateID=' + templateId : ''}`);
        cy.get('.ontotext-yasgui').should('be.visible');
        // When page is loaded the component is initializes twice, because of angular. The problem will be fixed
        // when all yasgui logic is extracted into a directive.
        cy.wait(1000);
    }

    static verifyUrl() {
        cy.url().should('include', '/sparql-template/create');
    }

    static getSaveButton() {
        return cy.get('.save-query-btn');
    }

    static clickOnSaveButton() {
        SparqlCreateUpdateSteps.getSaveButton().click();
    }

    static getCancelButton() {
        return cy.get('.cancel-query-btn');
    }

    static clickOnCancelButton() {
        SparqlCreateUpdateSteps.getCancelButton().click();
    }

    static typeTemplateId(templateId) {
        SparqlCreateUpdateSteps.getTemplateIdField()
            .should('exist')
            .click()
            // force is needed because ontotext-yasgui is created with focus on editor
            // and if it appears in the middle of templateId typing the last part of template is written in ontotext-yasgui instead input element.
            .type(templateId, {force: true});
    }

    static getTemplateIdField() {
        return cy.get('.sparql-template-id');
    }

    static getRequiredErrorElement() {
        return cy.get('.template-id-required');
    }

    static getInvalidErrorElement() {
        return cy.get('.template-id-invalid');
    }

    static getInvalidQueryModeElement() {
        return cy.get('.invalid-query-mode');
    }

    static getInvalidQueryElement() {
        return cy.get('.invalid-query');
    }
}
