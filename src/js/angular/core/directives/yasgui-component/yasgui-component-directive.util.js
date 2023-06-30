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
