/**
 * @ngdoc directive
 * @name editableContent
 * @module graphdb.framework.core.directives.editable-content
 * @restrict E
 * @description
 * A reusable contenteditable directive bound to an ngModel. It allows editable plain-text input and supports disabling and placeholder text.
 *
 * @param {string} ngModel - The model to bind contenteditable input to.
 * @param {boolean=} ngDisabled - Disables the contenteditable field when true.
 * @param {string=} placeholder - Placeholder text to show when input is empty.
 */
const modules = [];

angular
    .module('graphdb.framework.core.directives.editable-content', modules)
    .directive('editableContent', editableContent);

editableContent.$inject = [];

function editableContent() {
    return {
        restrict: 'E',
        require: 'ngModel',
        scope: {
            ngModel: '=',
            ngDisabled: '=',
            placeholder: '@'
        },
        templateUrl: 'js/angular/core/templates/editable-content/editable-content.html',
        link: function(scope, element, attrs, ngModelCtrl) {

            // =========================
            // Private variables
            // =========================

            const editableDiv = element.find('div');

            // =========================
            // Private functions
            // =========================

            /**
             * Updates the bound ngModel with the current contenteditable value.
             * Also clears invalid HTML when only whitespace remains.
             */
            const updateModelValue = () => {
                if (!scope.ngDisabled) {
                    scope.$apply(() => {
                        if (editableDiv.html().length && !editableDiv.text().trim().length) {
                            // Fixes a problem with the placeholder when type some word and delete it.
                            editableDiv.empty();
                        }
                        ngModelCtrl.$setViewValue(editableDiv[0].innerText);
                    });
                }
            };

            /**
             * Renders the model value into the contenteditable element.
             */
            ngModelCtrl.$render = () => {
                editableDiv.html(ngModelCtrl.$viewValue || '');
            };

            /**
             * Handles paste events in the contenteditable element by inserting plain text only.
             * Prevents the default paste behavior and manually inserts the clipboard text as plain text,
             * preserving line breaks by converting them to <br> elements.
             *
             * @param {Event} event - The paste event object containing clipboard data.
             */
            const pasteHandler = (event) => {
                event.preventDefault();

                const text = (event.originalEvent || event).clipboardData.getData('text/plain');
                const selection = window.getSelection();

                if (!selection.rangeCount) return;

                selection.deleteFromDocument();
                const range = selection.getRangeAt(0);
                const fragment = document.createDocumentFragment();
                const lines = text.split('\n');

                lines.forEach((line, index) => {
                    fragment.appendChild(document.createTextNode(line));
                    if (index < lines.length - 1) {
                        fragment.appendChild(document.createElement('br'));
                    }
                });

                range.insertNode(fragment);
                selection.collapseToEnd();
            }

            // =========================
            // Subscriptions
            // =========================

            /**
             * Unsubscribes from all watchers and event listeners to prevent memory leaks.
             */
            const removeAllSubscribers = () => {
                editableDiv.off('blur keyup change input', updateModelValue);
                editableDiv.off('paste', pasteHandler);
            };

            scope.$on('$destroy', removeAllSubscribers);
            editableDiv.on('blur keyup change input', updateModelValue);
            editableDiv.on('paste', pasteHandler)
        }
    };
}
