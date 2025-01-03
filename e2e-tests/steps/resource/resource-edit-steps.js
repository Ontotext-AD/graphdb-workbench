const VIEW_URL = 'esource/edit';

export class ResourceEditSteps {
    static visit() {
        cy.visit(VIEW_URL);
    }

    static verifyUrl() {
        cy.url().should('eq', `${Cypress.config('baseUrl')}${VIEW_URL}`);
    }

    static getResourceTableElement() {
        return cy.get('.table-striped');
    }

    static getNewPredicateInput() {
        return ResourceEditSteps.getResourceTableElement().find('.predicate-input');
    }

    static getNewSuggestionsElement() {
        return cy.get('.predicate-suggestions');
    }

    static selectPredicateSuggestion(suggestion = 'agg') {
        ResourceEditSteps.getNewSuggestionsElement().contains(suggestion).find('.predicate-suggestion').click();
    }

    static getObjectTypeSelectorElement() {
        return cy.get('.object-type-selector');
    }

    static openObjectTypeSelector() {
        ResourceEditSteps.getObjectTypeSelectorElement().click();
    }

    static getObjectTypeOptionElement(objectType = 'IRI') {
        return ResourceEditSteps.getObjectTypeSelectorElement().find('option').contains(objectType);
    }

    static selectObjectType(objectType) {
        ResourceEditSteps.getObjectTypeOptionElement().contains(objectType).click();
    }

    static getObjectUriTextInput() {
        return cy.get('#objectUriText');
    }

    static getObjectIriTypeSuggestionsElement() {
        return cy.get('.object-iri-type-suggestions');
    }

    static getObjectIriTypeSuggestions(iri = 'agg') {
        return ResourceEditSteps.getObjectIriTypeSuggestionsElement().find('.object-iri-type-suggestion').contains(iri);
    }

    static selectObjectIriType(iri) {
        ResourceEditSteps.getObjectIriTypeSuggestions(iri).click();
    }

    static getObjectLiteralTypeSelectorElement() {
        return cy.get('.literalType');
    }

    static openObjectLiteralTypeSelector() {
        ResourceEditSteps.getObjectLiteralTypeSelectorElement().click();
    }

    static getObjectLiteralTypeOption(literalType = 'string') {
        return ResourceEditSteps.getObjectLiteralTypeSelectorElement().find('option');
    }

    static selectObjectLiteralType(literalType) {
        ResourceEditSteps.getObjectLiteralTypeOption(literalType).click();
    }

    static getObjectLiteralManualInput() {
        return cy.get('#languageText');
    }

    static getContextInput() {
        return cy.get('.context-input');
    }

    static getContextSuggestionsElement() {
        return cy.get('.context-suggestions');
    }

    static getContextSuggestion() {
        return ResourceEditSteps.getContextSuggestionsElement().find('.context-suggestion');
    }

    static selectContextSuggestion(contextSuggestion = 'agg') {
        ResourceEditSteps.getContextSuggestion().click();
    }

    static getViewTrigButton() {
        return cy.get('.view-trig-btn');
    }

    static clickOnViewTrigButton() {
        ResourceEditSteps.getViewTrigButton().click();
    }

    static getSaveButton() {
        return cy.get('.save-btn');
    }

    static clickOnSaveButton() {
        ResourceEditSteps.getSaveButton().click();
    }
}
