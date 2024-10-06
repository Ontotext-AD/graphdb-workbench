import {TTYGEventName} from "../services/ttyg-context.service";

angular
    .module('graphdb.framework.ttyg.directives.no-agents-view', [])
    .directive('noAgentsView', NoAgentsView);

NoAgentsView.$inject = ['TTYGContextService'];

function NoAgentsView(TTYGContextService) {
    return {
        restrict: 'E',
        templateUrl: 'js/angular/ttyg/templates/no-agents-view.html',
        scope: {
        },
        link: ($scope, element, attrs) => {

            // =========================
            // Public functions
            // =========================

            $scope.onCreateAgent = () => {
                TTYGContextService.emit(TTYGEventName.OPEN_AGENT_SETTINGS);
            };
        }
    };
}
