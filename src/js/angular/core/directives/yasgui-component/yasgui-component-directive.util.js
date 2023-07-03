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

export const DISABLE_YASQE_BUTTONS_CONFIGURATION = [
    {
        name: 'createSavedQuery',
        visible: false
    }, {
        name: 'showSavedQueries',
        visible: false
    }, {
        name: 'shareQuery',
        visible: false
    }, {
        name: 'includeInferredStatements',
        visible: false
    }
];
