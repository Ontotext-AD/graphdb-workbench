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
}
