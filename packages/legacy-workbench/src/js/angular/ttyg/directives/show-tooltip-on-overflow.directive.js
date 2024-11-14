const modules = [];

angular
    .module('graphdb.framework.ttyg.directives.show-tooltip-on-overflow', modules)
    .directive('showTooltipOnOverflow', ShowTooltipOnOverflow);

function ShowTooltipOnOverflow() {
    return {
        link: function(scope, element) {
            function updateTooltip() {
                const innerTextElement = element[0].querySelector('.editable-text-element');
                if (!innerTextElement) return;

                if (innerTextElement.scrollWidth > innerTextElement.clientWidth) {
                    element.attr('title', scope.chat.name);
                } else {
                    element.removeAttr('title');
                }
            }

            // Needed in order to have values for scrollWidth and clientWidth
            setTimeout(updateTooltip, 0);
        }
    };
}
