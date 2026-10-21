export class RepositoryErrorsWidgetSteps {
    static getWidget() {
        return cy.get('.repository-errors-container');
    }

    static getCreateRepositoryBtn() {
        return RepositoryErrorsWidgetSteps.getWidget().find('.create-repository-btn');
    }

    static getRepositoryFilter() {
        return RepositoryErrorsWidgetSteps.getWidget().find('.filter-name input');
    }

    static getLocalOnlyCheckbox() {
        return RepositoryErrorsWidgetSteps.getWidget().find('.filter-local-only input[type=checkbox]');
    }

    static getInfoMessage() {
        return RepositoryErrorsWidgetSteps.getWidget().find('.info-message');
    }

    static getRepositoryList() {
        return RepositoryErrorsWidgetSteps.getWidget().find('.repos .repository');
    }
}
