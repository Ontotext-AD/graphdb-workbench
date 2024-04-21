import {ImportResourceStatus} from "../../models/import/import-resource-status";
import * as stringUtils from "../../utils/string-utils";

const modules = [];

angular
    .module('graphdb.framework.import.directives.import-resource-message', modules)
    .directive('importResourceMessage', importResourceMessageDirective);

importResourceMessageDirective.$inject = [];

function importResourceMessageDirective() {
    return {
        restrict: 'E',
        templateUrl: 'js/angular/import/templates/import-resource-message.html',
        scope: {
            resource: '='
        },
        link: ($scope) => {
            $scope.ImportResourceStatus = ImportResourceStatus;
            $scope.toTitleCase = (str) => stringUtils.toTitleCase(str);
            $scope.hasReplacedGraphs = $scope.resource.importResource.numReplacedGraphs > 0;
            $scope.hasAddedStatements = $scope.resource.importResource.addedStatements > 0;
            $scope.hasRemovedStatements = $scope.resource.importResource.removedStatements > 0;
        }
    };
}
