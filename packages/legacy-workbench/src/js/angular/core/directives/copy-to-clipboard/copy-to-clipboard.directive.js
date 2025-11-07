/**
 * @ngdoc directive
 * @name copyToClipboard
 * @module graphdb.framework.core.directives.copytoclipboard.copytoclipboard
 * @restrict E
 *
 * @description
 * `copyToClipboard` is a directive that creates a button which, when clicked, copies a specific text to the clipboard.
 * The directive uses an isolated scope with multiple properties to support both default and custom styling behaviors.
 *
 * - By default, the button shows a translated tooltip on hover and triggers a copy to clipboard operation.
 * - In a custom behavior mode (enabled via `customTooltipStyle`), the directive suppresses the tooltip and instead displays a styled inline tooltip on click.
 * - The copy operation can be targeted to a specific element using `targetSelector`, useful when triggering the directive indirectly (e.g. clicking on a container).
 * - The success message via `toastr` can also be disabled if custom feedback is handled separately.
 *
 * @param {string} tooltipText - The text to be displayed as a tooltip when hovering over the button. One-time bound by default.
 * @param {string} textToCopy - (optional) The text to be copied. If not passed, the directive will search for an element with class `copyable` within the parent element.
 * @param {boolean} customTooltipStyle - (optional) If true, suppresses the default tooltip and shows a custom-styled tooltip near the icon on click.
 * @param {string} targetSelector - (optional) A CSS selector used to locate an external DOM element to which the tooltip should be anchored.
 * @param {string} customTooltipText - (optional) The text to display in the custom tooltip.
 *
 * @example
 * <!-- Default usage -->
 * <copy-to-clipboard tooltip-text="Your tooltip text here"></copy-to-clipboard>
 *
 * @example
 * <!-- With custom copy text -->
 * <copy-to-clipboard tooltip-text="'Click to copy'" text-to-copy="{{valueToCopy}}"></copy-to-clipboard>
 *
 * @example
 * <!-- With custom tooltip behavior and external target -->
 * <div class="item" id="itemId">
 *   <copy-to-clipboard
 *     text-to-copy="{{valueToCopy}}"
 *     custom-tooltip-style="true"
 *     ng-attr-target-selector="#itemId">
 *   </copy-to-clipboard>
 * </div>
 */
import {LoggerProvider} from "../../services/logger-provider";

angular
    .module('graphdb.framework.core.directives.copytoclipboard.copytoclipboard', [])
    .directive('copyToClipboard', copyToClipboard);

copyToClipboard.$inject = ['$translate', 'toastr'];
const logger = LoggerProvider.logger;
/**
 * @ngdoc method
 * @name copyToClipboard
 * @methodOf graphdb.framework.core.directives.copytoclipboard.copytoclipboard
 *
 * @description
 * The `copyToClipboard` function is the link function of the directive.
 * It defines a `copyToClipboard` function in the directive's scope that gets the text from the element with the class `copyable` that is a child of the directive's parent element.
 * It then uses the `navigator.clipboard.writeText` function to write this text to the clipboard. If the browser does not support `navigator.clipboard`, `document.execCommand('copy')` is used instead.
 * If the text is successfully written to the clipboard, a success message is displayed using the `toastr` service.
 * If an error occurs, the error is logged to the console.
 *
 * @param {Object} $scope - The directive's isolated scope.
 * @param {Object} element - The jqLite-wrapped element that this directive matches.
 */
function copyToClipboard($translate, toastr) {
    return {
        template: `
            <style>
                .copy-btn {
                    line-height: 0.75;
                    position: relative;
                }

                .custom-link-icon {
                    opacity: 0;
                    margin-left: 5px;
                    transition: opacity 0.2s ease-in-out;
                    color: var(--gw-secondary-base);
                }

                .copy-btn:hover .custom-link-icon {
                    opacity: 1;
                }

                 .copy-btn:hover .custom-link-icon {
                    opacity: 1;
                }

                .custom-link-icon.visible {
                    opacity: 1 !important;
                }

                .custom-tooltip-popup {
                    font-family: Arial, sans-serif;
                    position: absolute;
                    background: #000000;
                    color: #FFFFFF;
                    padding: 5px 8px;
                    margin: 0 5px;
                    border-radius: 4px;
                    font-size: 12px;
                    z-index: 9999;
                    opacity: 0;
                    transition: opacity 0.2s ease-in-out;
                    line-height: 0.75;
                }

                .custom-tooltip-popup.show {
                    opacity: 1;
                }
            </style>
            <button
                class="btn btn-link btn-sm copy-btn"
                ng-if="!customTooltipStyle"
                gdb-tooltip="{{tooltipText | translate}}"
                ng-click="copyToClipboard($event)">
                <i class="ri-file-copy-line link-icon" aria-hidden="true"></i>
            </button>
            <button
                class="btn btn-link btn-sm copy-btn"
                ng-if="customTooltipStyle"
                ng-click="copyToClipboard($event)">
                <i class="ri-file-copy-line custom-link-icon" aria-hidden="true" ng-class="{'visible': alwaysShowIcon === 'true'}"></i>
            </button>
        `,
        restrict: 'E',
        scope: {
            tooltipText: '@',
            textToCopy: '@',
            customTooltipStyle: '@?',
            targetSelector: '@?',
            customTooltipText: '@?',
            successMessage: '@?',
        },
        link: function($scope, element) {
            $scope.copyToClipboard = function() {
                const textToCopy = $scope.textToCopy ? $scope.textToCopy : element.parent().find('.copyable').text();

                function showCustomTooltip() {
                    const tooltip = document.createElement("span");
                    tooltip.innerText = $scope.customTooltipText;
                    tooltip.className = "custom-tooltip-popup";
                    const iconElement = element[0].querySelector('.custom-link-icon');

                    iconElement.appendChild(tooltip);

                    requestAnimationFrame(() => {
                        tooltip.classList.add("show");
                    });

                    setTimeout(() => {
                        tooltip.classList.remove("show");
                        setTimeout(() => tooltip.remove(), 200);
                    }, 1500);
                }

                function showSuccessFeedback() {
                    if ($scope.customTooltipStyle) {
                        showCustomTooltip();
                    } else {
                        const message = $scope.successMessage || $translate.instant('common.messages.copied_to_clipboard');
                        toastr.success(message);
                    }
                }

                function fallbackCopy(text) {
                    // document.execCommand('copy') can only copy text that is selected. The browser requires a selected
                    // text range to perform the copy operation. So the string is temporarily placed into a selectable form.
                    const tempTextArea = document.createElement('textarea');
                    tempTextArea.value = text;
                    document.body.appendChild(tempTextArea);
                    tempTextArea.select();

                    try {
                        const successful = document.execCommand('copy');
                        if (successful) {
                            showSuccessFeedback();
                        } else {
                            logger.error('Unable to copy text');
                        }
                    } catch (err) {
                        logger.error('Could not copy text: ', err);
                    } finally {
                        document.body.removeChild(tempTextArea);
                    }
                }

                if (navigator.clipboard) {
                    navigator.clipboard.writeText(textToCopy).then(() => {
                        showSuccessFeedback();
                    }).catch((err) => {
                        logger.error('Could not copy text: ', err);
                        fallbackCopy(textToCopy);
                    });
                } else {
                    fallbackCopy(textToCopy);
                }
            };

            // Clicking the targetSelector will trigger copy
            if ($scope.customTooltipStyle && $scope.targetSelector) {
                // Delay to ensure DOM is fully loaded when dynamically rendering
                setTimeout(() => {
                    const target = document.querySelector($scope.targetSelector);
                    if (target) {
                        const clickHandler = function(e) {
                            e.stopPropagation();
                            $scope.copyToClipboard();
                        };
                        target.addEventListener('click', clickHandler);

                        $scope.$on('$destroy', () => {
                            target.removeEventListener('click', clickHandler);
                        });
                    } else {
                        logger.warn('copyToClipboard: targetSelector not found:', $scope.targetSelector);
                    }
                }, 0);
            }
        },
    };
}
