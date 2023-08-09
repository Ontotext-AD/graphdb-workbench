export const YasguiComponentDirectiveUtil = (function () {

    const getOntotextYasguiElementController = (directiveSelector) => {
        const elementById = angular.element(document.querySelector(directiveSelector));
        const directiveElement = angular.element(elementById);
        return directiveElement.isolateScope();
    };

    /**
     * Fetches yasgui component.
     *
     * @param {string} directiveSelector - the unique selector of the yasgui component directive.
     *
     * @return {YasguiComponent}
     */
    const getOntotextYasguiElement = (directiveSelector) => {
        return YasguiComponentDirectiveUtil.getOntotextYasguiElementController(directiveSelector).getOntotextYasguiElement();
    };

    /**
     * Fetches yasgui component.
     *
     * @param {string} directiveSelector - the unique selector of the yasgui component directive.
     *
     * @return {Promise<YasguiComponent>}
     */
    const getOntotextYasguiElementAsync = (directiveSelector) => {
        return new Promise((resolve, reject) => {
            let directive = getOntotextYasguiElementController(directiveSelector);
            if (directive) {
                resolve(directive.getOntotextYasguiElement());
            }
            // TODO add max interval time.

            const interval = setInterval(() => {
                directive = getOntotextYasguiElementController(directiveSelector);
                if (directive) {
                    clearInterval(interval);
                    resolve(directive.getOntotextYasguiElement());
                }
            }, 100);
        });
    };

    return {
        getOntotextYasguiElementController,
        getOntotextYasguiElement,
        getOntotextYasguiElementAsync
    };
})();

export class YasqeButtonsBuilder {

    constructor() {
        this.createSavedQueryVisibility = false;
        this.showSavedQueriesVisibility = false;
        this.shareQueryVisibility = false;
        this.includeInferredStatementsVisibility = false;
    }

    addCreateSavedQuery() {
        this.createSavedQueryVisibility = true;
        return this;
    }

    addShowSavedQueries() {
        this.showSavedQueriesVisibility = true;
        return this;
    }

    addShareQuery() {
        this.shareQueryVisibility = true;
        return this;
    }

    addIncludeInferredStatements() {
        this.includeInferredStatementsVisibility = true;
        return this;
    }

    build() {
        return [
            {
                name: YasqeButtonName.CREATE_SAVED_QUERY,
                visible: this.createSavedQueryVisibility
            }, {
                name: YasqeButtonName.SHOW_SAVED_QUERIES,
                visible: this.showSavedQueriesVisibility
            }, {
                name: YasqeButtonName.SHARE_QUERY,
                visible: this.shareQueryVisibility
            }, {
                name: YasqeButtonName.INCLUDE_INFERRED_STATEMENTS,
                visible: this.includeInferredStatementsVisibility
            }
        ];
    }
}

export const YasqeButtonName = {
    CREATE_SAVED_QUERY: 'createSavedQuery',
    SHOW_SAVED_QUERIES: 'showSavedQueries',
    SHARE_QUERY: 'shareQuery',
    EXPANDS_RESULTS: 'expandResults',
    INFER_STATEMENTS: 'inferStatements',
    INCLUDE_INFERRED_STATEMENTS: 'includeInferredStatements'
};

export const DISABLE_YASQE_BUTTONS_CONFIGURATION = new YasqeButtonsBuilder().build();
export const INFERRED_AND_SAME_AS_BUTTONS_CONFIGURATION = new YasqeButtonsBuilder().addIncludeInferredStatements().build();
