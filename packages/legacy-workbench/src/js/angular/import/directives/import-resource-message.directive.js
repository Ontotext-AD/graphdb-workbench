import 'angular/import/controllers/import-resource-message-dialog.controller';
import {ImportResourceStatus} from "../../models/import/import-resource-status";
import * as stringUtils from "../../utils/string-utils";

const modules = ['graphdb.framework.impex.import.controllers.import-resource-message-dialog'];

angular
    .module('graphdb.framework.import.directives.import-resource-message', modules)
    .directive('importResourceMessage', importResourceMessageDirective);

importResourceMessageDirective.$inject = ['$uibModal'];

function importResourceMessageDirective($uibModal) {
    return {
        restrict: 'E',
        templateUrl: 'js/angular/import/templates/import-resource-message.html',
        scope: {
            resource: '='
        },
        link: ($scope) => {
            $scope.ImportResourceStatus = ImportResourceStatus;
            $scope.toTitleCase = (str) => stringUtils.toTitleCase(str);

            /**
             *
             * @param {ImportResourceTreeElement} resourceTreeElement
             */
            $scope.showMessage = (resourceTreeElement) => {
                $uibModal.open({
                    templateUrl: 'js/angular/import/templates/import-resource-message-dialog.html',
                    controller: 'ImportResourceMessageDialogController',
                    size: 'lg',
                    windowClass: 'import-resource-message-dialog',
                    backdrop: 'static',
                    resolve: {
                        message: function () {
                            return resourceTreeElement ? resourceTreeElement.importResource.message : '';
                        }
                    }
                });
            }
        }
    };
}
