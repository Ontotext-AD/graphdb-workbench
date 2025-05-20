export class RepositoryErrorsWidgetSteps {
    static getWidget() {
        return cy.get('.repository-errors-container');
    }

    static getCreateRepositoryBtn() {
        return RepositoryErrorsWidgetSteps.getWidget().find('.create-repository-btn');
    }

    static getShowRemoteLocationsBtn() {
        return RepositoryErrorsWidgetSteps.getWidget().find('.show-remote-locations-btn');
    }

    static getInfoMessage() {
        return RepositoryErrorsWidgetSteps.getWidget().find('.info-message');
    }

    static getRepositoryList() {
        return RepositoryErrorsWidgetSteps.getWidget().find('.repos .repository');
    }
}
