/**
 * Enum for field types.
 * @readonly
 * @enum {string}
 */
export const FIELD_TYPE = {
    STRING: 'string',
    TEXT: 'text',
    BOOLEAN: 'boolean',
    JSON: 'json',
    SELECT: 'select',
    MULTI_SELECT: 'multi_select'
}

/**
 * @function dynamicFormDirective
 * @description
 * A directive for rendering a dynamic form based on an array of field objects.
 *
 * This directive creates a form where each object in the provided fields defines the type of input to render
 * (for example, text input, checkbox, dropdown, multi-select, or textarea for JSON data). The directive uses the
 * {@link FIELD_TYPE} enum to determine which input type to display. For select and multi-select fields, the
 * {@link SelectMenuOptionsModel} should be used to model the options.
 *
 * Additionally, the directive supports an optional `onValidityChange` callback that will be called whenever the overall
 * validity of the form changes. This is useful for informing a parent component or controller about the current form validity.
 *
 * @example
 * ### HTML Usage:
 * ```html
 * <dynamic-form fields="myFields" on-validity-change="handleValidityChange(valid)"></dynamic-form>
 * ```
 *
 * ### Controller Example:
 * ```javascript
 * angular.module('myApp', [])
 *   .controller('ExampleController', function($scope) {
 *     $scope.myFields = [
 *       { label: 'Name', type: FIELD_TYPE.STRING, value: 'John Doe', required: true },
 *       { label: 'Favorite Color', type: FIELD_TYPE.SELECT, value: new SelectMenuOptionsModel({ label: 'Red', value: 'red' }), values: [
 *         new SelectMenuOptionsModel({ label: 'Red', value: 'red' }),
 *         new SelectMenuOptionsModel({ label: 'Blue', value: 'blue' })
 *       ], required: true },
 *       { label: 'Interests', type: FIELD_TYPE.MULTI_SELECT, value: [], values: [
 *         new SelectMenuOptionsModel({ label: 'Sports', value: 'sports' }),
 *         new SelectMenuOptionsModel({ label: 'Music', value: 'music' })
 *       ] },
 *       { label: 'Active', type: FIELD_TYPE.BOOLEAN, value: true },
 *       { label: 'Description', type: FIELD_TYPE.TEXT, value: 'A short description' },
 *       { label: 'Settings', type: FIELD_TYPE.JSON, value: '{ "key": "value" }' }
 *     ];
 *
 *     $scope.handleValidityChange = (isValid) => {
 *       console.log('Form valid:', isValid);
 *     };
 *   });
 * ```
 *
 * @param {Object[]} field - The array of field objects used to render the form fields.
 * @param {string} field[].label - The label displayed for the input.
 * @param {string} field[].type - The type of field input. Should be one of the values defined in {@link FIELD_TYPE}.
 * @param {*} field[].value - The current value of the field.
 * @param {SelectMenuOptionsModel[]} [field[].values] - The array of possible options for select and multi-select fields.
 * @param {(string|RegExp)} [field[].regex] - A regular expression or its string representation for validating the field value.
 * @param {boolean} [field[].required=false] - Indicates whether the field is required.
 *
 * @returns {Object} The directive definition object.
 */
const modules = [];
angular
    .module('graphdb.framework.core.directives.dynamic-form', modules)
    .directive('dynamicForm', dynamicFormDirective);

dynamicFormDirective.$inject = [];

function dynamicFormDirective() {
    return {
        restrict: 'E',
        scope: {
            fields: '=',
            onValidityChange: '&?',
            formCtrl: '=?'
        },
        templateUrl: 'js/angular/core/directives/dynamic-form/templates/dynamic-form.html',
        link: function($scope, element) {
            // =========================
            // Public variables
            // =========================
            $scope.FIELD_TYPE = FIELD_TYPE;
            $scope.formCtrl = undefined;

            // =========================
            // Private function
            // =========================
            const init = () => {
                const formElement = element.find('form');
                const formCtrl = formElement.controller('form');

                if (!formCtrl) {
                    console.error('Form controller not found!');
                    return;
                }

                $scope.formCtrl = formCtrl;
                const originalSetValidity = formCtrl.$setValidity;
                $scope.formCtrl.$setValidity = function (validationToken, isValid, modelCtrl) {
                    originalSetValidity.call(formCtrl, validationToken, isValid, modelCtrl);
                    if ($scope.onValidityChange) {
                        $scope.onValidityChange({valid: formCtrl.$valid});
                    }
                };
            };

            // =========================
            // Initialization
            // =========================
            init();
        }
    };
}
