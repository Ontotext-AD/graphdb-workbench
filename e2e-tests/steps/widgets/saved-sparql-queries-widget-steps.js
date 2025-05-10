export class SavedSparqlQueriesWidgetSteps {
    static getWidget() {
        return cy.get('.saved-sparql-queries-widget');
    }

    static getWidgetName() {
        return this.getWidget().find('#saved-queries-label-home');
    }
}
