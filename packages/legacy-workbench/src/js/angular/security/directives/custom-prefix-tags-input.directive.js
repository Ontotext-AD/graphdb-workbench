angular
    .module('graphdb.framework.security.directives', [])
    .directive('customPrefixTagsInput', customPrefixTagsInputDirective);

/**
 * @ngdoc directive
 * @name customPrefixTagsInput
 * @module app
 * @restrict A
 * @description
 * The `customPrefixTagsInput` directive is used to check 'tags-input' for roles containing 'CUSTOM_' or '!CUSTOM_' prefix.
 *
 * If the value starts with either of these prefixes, a warning property will be set in ngModel.
 *
 * @usage
 * <tags-input custom-prefix-tags-input>{{yourModel.role}}</tags-input>
 *
 * @return {Object} Directive definition object with restrict and link properties.
 */
function customPrefixTagsInputDirective() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            const customPrefix = "CUSTOM_";
            const negatedCustomPrefix = "!CUSTOM_";
            const subscriptions = [];

            function hasCustomOrNegatedPrefix(tag) {
                return tag.startsWith(customPrefix) || tag.startsWith(negatedCustomPrefix);
            }

            // Check if the element is tags-input and has ngModel associated with it
            const isNgTagsInput = element[0].nodeName.toLowerCase() === 'tags-input';

            if (isNgTagsInput && attrs.ngModel) {
                const ngModelCtrl = element.controller('ngModel');

                if (isNgTagsInput) {
                    ngModelCtrl.$parsers.push(function (viewValue) {
                        if (Array.isArray(viewValue)) {
                            ngModelCtrl.$warning = viewValue.some((tag) => hasCustomOrNegatedPrefix(tag));
                        }
                        return viewValue;
                    });

                    subscriptions.push(scope.$watch(attrs.ngModel, function (newVal) {
                        if (Array.isArray(newVal)) {
                            ngModelCtrl.$warning = newVal.some((tag) => hasCustomOrNegatedPrefix(tag));
                        }
                    }, true));
                }
            }

            const unsubscribeListeners = () => {
                subscriptions.forEach((subscription) => subscription());
            };

            subscriptions.push(scope.$on('$destroy', unsubscribeListeners));
        }
    };
}
