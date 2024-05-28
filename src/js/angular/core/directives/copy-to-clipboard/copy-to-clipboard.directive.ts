import * as angular from 'angular';
/**
 * @ngdoc directive
 * @name copyToClipboard
 * @module graphdb.framework.core.directives.copytoclipboard.copytoclipboard
 * @restrict E
 *
 * @description
 * `copyToClipboard` is a directive that creates a button which, when clicked, copies a specific text to the clipboard.
 * The directive uses an isolated scope with a single property, `tooltipText`, which is bound to the `tooltipText` attribute of the element where the directive is used.
 * The tooltip text is translated using the `$translate` service.
 * The button also has an `ng-click` directive that triggers the `copyToClipboard` function when the button is clicked.
 *
 * @param {string} tooltipText - The text to be displayed as a tooltip when hovering over the button.
 *
 * @example
 * <copy-to-clipboard tooltip-text="Your tooltip text here"></copy-to-clipboard>
 */
angular
    .module('graphdb.framework.core.directives.copytoclipboard.copytoclipboard', [])
    .directive('copyToClipboard', copyToClipboard);

copyToClipboard.$inject = ['$translate', 'toastr'];

/**
 * @ngdoc method
 * @name copyToClipboard
 * @methodOf graphdb.framework.core.directives.copytoclipboard.copytoclipboard
 *
 * @description
 * The `copyToClipboard` function is the link function of the directive.
 * It defines a `copyToClipboard` function in the directive's scope that gets the text from the element with the class `copyable` that is a child of the directive's parent element.
 * It then uses the `navigator.clipboard.writeText` function to write this text to the clipboard.
 * If the text is successfully written to the clipboard, a success message is displayed using the `toastr` service.
 * If an error occurs, the error is logged to the console.
 *
 * @param {Object} $scope - The directive's isolated scope.
 * @param {Object} element - The jqLite-wrapped element that this directive matches.
 */
function copyToClipboard($translate, toastr) {
    return {
        template: '<button class="copy-btn" gdb-tooltip="{{tooltipText | translate}}" ng-click="copyToClipboard()"><span class="icon-copy"></span></button>',
        restrict: 'E',
        scope: {
            tooltipText: '@'
        },
        link: function ($scope, element) {
            $scope.copyToClipboard = function() {
                const textToCopy = element.parent().find('.copyable').text();
                navigator.clipboard.writeText(textToCopy).then(() => {
                    toastr.success($translate.instant('import.help.messages.copied_to_clipboard'));
                }, (err) => {
                    console.error('Could not copy text: ', err);
                });
            };
        }
    };
}
