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
            // Public variables
            // =========================

            $scope.canModifyAgent = false;

            // =========================
            // Public functions
            // =========================

            $scope.onCreateAgent = () => {
                TTYGContextService.emit(TTYGEventName.OPEN_AGENT_SETTINGS);
            };

            // =========================
            // Private functions
            // =========================

            const onCanUpdateAgentUpdated = (canModifyAgent) => {
                $scope.canModifyAgent = canModifyAgent;
            };

            // =========================
            // Subscriptions
            // =========================
            const subscriptions = [];

            const onDestroy = () => {
                subscriptions.forEach((subscription) => subscription());
            };
            subscriptions.push(TTYGContextService.onCanUpdateAgentUpdated(onCanUpdateAgentUpdated));
            $scope.$on('$destroy', onDestroy);
        }
    };
}
