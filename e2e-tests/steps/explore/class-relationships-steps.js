export class ClassRelationshipsSteps {
    static visit() {
        cy.visit('/relationships');
    }

    static getFilterField() {
        return cy.get('.search-filter-field');
    }

    static filterByClass(name) {
        this.getFilterField().type(name);
    }

    static getDirectionFilter() {
        return cy.get('.direction-filter');
    }

    static verifySelectedDirectionFilter(name) {
        this.getDirectionFilter().find('input[type=radio]:checked').should('have.value', name);
    }

    static getRelationsToolbar() {
        return cy.get('.relations-toolbar');
    }

    static verifyRelationsToolbarContent() {
        this.getRelationsToolbar().should('be.visible');
        this.removeAllClassesButton().should('be.visible');
        this.getReloadDiagramButton().should('be.visible');
        this.getExportDiagramButton().should('be.visible');
    }

    static getDependenciesList() {
        return cy.get('#wb-dependencies-classInClasses');
    }

    static verifyListLength(count) {
        this.getDependenciesList().find('.item .row').should('have.length', count);
    }

    static getNoDataWarning() {
        return cy.get('div.alert.alert-warning');
    }

    static getReloadDiagramButton() {
        return cy.get('.reload-diagram-btn');
    }

    static getExportDiagramButton() {
        return this.getRelationsToolbar().find('.export-diagram-btn');
    }

    static removeAllClassesButton() {
        return this.getRelationsToolbar().find('.remove-all-classes-btn');
    }

    static getDependenciesDiagram() {
        return cy.get('#dependencies-chord');
    }

    static getAvailableDependenciesLabel() {
        return cy.get('.available-dependencies-label');
    }
}
