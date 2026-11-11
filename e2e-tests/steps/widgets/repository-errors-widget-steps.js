export class RepositoryErrorsWidgetSteps {
    static getWidget() {
        return cy.get('.repository-errors-container');
    }

    static getCreateRepositoryBtn() {
        return RepositoryErrorsWidgetSteps.getWidget().find('.create-repository-btn');
    }

    static getRepositoryFilter() {
        return RepositoryErrorsWidgetSteps.getWidget().getByTestId('core-errors-repository-filter');
    }

    static getLocalOnlyCheckbox() {
        return RepositoryErrorsWidgetSteps.getWidget().getByTestId('core-errors-local-only-checkbox');
    }

    static getInfoMessage() {
        return RepositoryErrorsWidgetSteps.getWidget().find('.info-message');
    }

    static getRepositoryList() {
        return RepositoryErrorsWidgetSteps.getWidget().find('.repos .repository');
    }

    static getRepositoryFedxDeprecatedTag(repositoryId) {
        return RepositoryErrorsWidgetSteps.getWidget()
            .contains('[data-test="core-errors-repository-id"]', repositoryId)
            .closest('[data-test="core-errors-repository"]')
            .getByTestId('core-errors-fedx-deprecated-tag');
    }
}
