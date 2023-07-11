export const YasguiComponentDirectiveUtil = (function () {

    const getOntotextYasguiElementController = (directiveSelector) => {
        const elementById = angular.element(document.querySelector(directiveSelector));
        const directiveElement = angular.element(elementById);
        return directiveElement.isolateScope();
    };

    const getOntotextYasguiElement = (directiveSelector) => {
        return YasguiComponentDirectiveUtil.getOntotextYasguiElementController(directiveSelector).getOntotextYasguiElement();
    };

    return {
        getOntotextYasguiElementController,
        getOntotextYasguiElement
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
                name: 'createSavedQuery',
                visible: this.createSavedQueryVisibility
            }, {
                name: 'showSavedQueries',
                visible: this.showSavedQueriesVisibility
            }, {
                name: 'shareQuery',
                visible: this.shareQueryVisibility
            }, {
                name: 'includeInferredStatements',
                visible: this.includeInferredStatementsVisibility
            }
        ];
    }
}

export const DISABLE_YASQE_BUTTONS_CONFIGURATION = new YasqeButtonsBuilder().build();
export const INFERRED_AND_SAME_AS_BUTTONS_CONFIGURATION = new YasqeButtonsBuilder().addIncludeInferredStatements().build();
