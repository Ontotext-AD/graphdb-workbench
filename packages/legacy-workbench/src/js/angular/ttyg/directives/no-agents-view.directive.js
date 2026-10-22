import {TTYGEventName} from "../services/ttyg-context.service";
import {UriUtil} from '@ontotext/workbench-api';

angular
    .module('graphdb.framework.ttyg.directives.no-agents-view', [])
    .directive('noAgentsView', NoAgentsView);

NoAgentsView.$inject = ['TTYGContextService', 'productInfo'];

function NoAgentsView(TTYGContextService, productInfo) {
    return {
        restrict: 'E',
        templateUrl: 'js/angular/ttyg/templates/no-agents-view.html',
        scope: {
            canCreateAgent: '=',
        },
        link: ($scope) => {
            // =========================
            // Public variables
            // =========================
            $scope.talkToGraphDocumentationLink = UriUtil.resolveDocumentationUrl(productInfo.shortVersion, 'talk-to-graph.html');

            // =========================
            // Public functions
            // =========================

            $scope.onCreateAgent = () => {
                TTYGContextService.emit(TTYGEventName.OPEN_AGENT_SETTINGS);
            };
        },
    };
}
