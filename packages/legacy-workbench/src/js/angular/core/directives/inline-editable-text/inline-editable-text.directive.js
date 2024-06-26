/**
 * @ngdoc directive
 * @name graphdb.framework.core.directives:inlineEditableText
 * @restrict E
 * @description
 * A directive for inline editing of text fields. It provides a simple interface to display text,
 * switch to an editable input field on double-click, and save or cancel changes.
 *
 * The directive allows for customizable save, cancel, click, and double-click actions.
 *
 * @param {string} fieldName - The name of the field in the source object to be edited.
 * @param {Object} source - The object containing the field to be edited.
 * @param {function} onSave - The function to be called when saving the edited text.
 *                            It passes an object with the new text and the source object.
 * @param {function} onCancel - The function to be called when editing is canceled.
 * @param {function} onClick - The function to be called on single-click.
 * @param {function} onDblclick - The function to be called on double-click.
 * @param {boolean} isEditing - A flag indicating whether the text is currently being edited.
 *
 * @example
 * <inline-editable-text
 *    field-name="name"
 *    source="item"
 *    on-save="saveFunction(newText, source)"
 *    on-cancel="cancelFunction()"
 *    on-click="clickFunction(source)"
 *    on-dblclick="dblClickFunction(source)"
 *    is-editing="item.isEditing">
 * </inline-editable-text>
 *
 * @requires $timeout
 */
angular
    .module('graphdb.framework.core.directives.inline-editable-text', [])
    .directive('inlineEditableText', InlineEditableText);

InlineEditableText.$inject = ['$timeout'];

function InlineEditableText($timeout) {
    return {
        restrict: 'E',
        scope: {
            /**
             * {@type {text}}
             */
            fieldName: '@',
            source: '=',
            onSave: '&',
            onCancel: '&',
            onClick: '&',
            onDblclick: '&',
            isEditing: '='
        },
        templateUrl: 'js/angular/core/directives/inline-editable-text/templates/inline-editable-text.template.html',
        link: function (scope, element) {

            // =========================
            // Public variables
            // =========================
            scope.editableModel = {};

            // =========================
            // Private variables
            // =========================
            const subscriptions = [];
            let clickTimeout;

            // =========================
            // Public functions
            // =========================
            scope.onKeydown = (event) => {
                if (event.key === 'Enter') {
                    cancelClickTimeout();
                    if (scope.editableModel.text !== scope.text) {
                        scope.onSave({newText:scope.editableModel.text, source: scope.source});
                    }
                } else if (event.key === 'Escape') {
                   cancelEditing();
                }
            };

            scope.onCancelEditing = () => {
                cancelEditing();
            };

            scope.onSelect = () => {
                if (clickTimeout) {
                    cancelClickTimeout();
                    scope.onDblclick({source: scope.source});
                } else {
                    clickTimeout = $timeout(function () {
                        scope.onClick({source: scope.source});
                        cancelClickTimeout();
                    }, 250);
                }
            };

            // =========================
            // Private functions
            // =========================
            const cancelEditing = () => {
                cancelClickTimeout();
                scope.onCancel();
            };

            const cancelClickTimeout = () => {
                $timeout.cancel(clickTimeout);
                clickTimeout = undefined;
            };

            const focusEditElement = () => {
                // Focus and select the text in the input field
                $timeout(() => {
                    const inputElement = element.find('input')[0];
                    inputElement.focus();
                    inputElement.select();
                }, 0);
            };

            // =========================
            // Subscription handlers
            // =========================
            const onIsEditChanged = (newVal) => {
                if (newVal) {
                    scope.editableModel.text = scope.source[scope.fieldName];
                    focusEditElement();
                }
            };

            // =========================
            // Subscriptions
            // =========================
            subscriptions.push(scope.$watch('isEditing', onIsEditChanged));

            const removeAllSubscribers = () => {
                subscriptions.forEach((subscription) => subscription());
                cancelClickTimeout();
            };

            // Deregister the watcher when the scope/directive is destroyed
            scope.$on('$destroy', removeAllSubscribers);
        }
    };
}
