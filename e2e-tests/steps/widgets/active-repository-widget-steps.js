export class ActiveRepositoryWidgetSteps {
    static getWidget() {
        return cy.get('.active-repo-widget');
    }

    static getWidgetName() {
        return this.getWidget().find('#active-repo-label-home');
    }

    static getActiveRepository() {
        return this.getWidget().find('.repo-info-home');
    }

    static getTotalStatements() {
        return this.getWidget().find('.total-statements .data-value');
    }

    static getExplicitStatements() {
        return this.getWidget().find('.explicit-statements .data-value');
    }

    static getInferredStatements() {
        return this.getWidget().find('.inferred-statements .data-value');
    }
}
