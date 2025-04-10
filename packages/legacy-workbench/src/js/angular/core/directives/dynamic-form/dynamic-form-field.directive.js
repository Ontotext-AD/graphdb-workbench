import {FIELD_TYPE} from "./field-type";

const modules = [];
angular
    .module('graphdb.framework.core.directives.dynamic-form-field', modules)
    .directive('dynamicFormField', dynamicFormFieldDirective);

dynamicFormFieldDirective.$inject = [];

function dynamicFormFieldDirective($compile) {
    return {
        restrict: 'E',
        scope: {
            field: '=',
            form: '=',
            translationKeyPrefix: '='
        },
        templateUrl: 'js/angular/core/directives/dynamic-form/templates/form-field-template.html',
        link: function($scope) {
            $scope.FIELD_TYPE = FIELD_TYPE;
        }
    };
}
