import 'angular/core/filters/readableTimestamp';
import 'angular/core/directives/inline-editable-text/inline-editable-text.directive';

const modules = [
    'graphdb.framework.core.filters.readable_titmestamp',
    'graphdb.framework.core.directives.inline-editable-text'
];

angular
    .module('graphdb.framework.ttyg.directives.agent-list', modules)
    .directive('agentList', AgentListComponent);

AgentListComponent.$inject = ['TTYGContextService', 'ModalService', '$translate'];

function AgentListComponent(TTYGContextService, ModalService, $translate) {
    return {
        restrict: 'E',
        templateUrl: 'js/angular/ttyg/templates/agent-list.html',
        scope: {
            agentList: '='
        },
        link: ($scope, element, attrs) => {

            // =========================
            // Public variables
            // =========================

            // =========================
            // Private variables
            // =========================

            // =========================
            // Public functions
            // =========================

            /**
             * Triggers the agent edit process.
             * @param {AgentModel} agent
             */
            $scope.onEditAgent = (agent) => {
                console.log('Edit agent', agent);
            };

            /**
             * Triggers the agent clone process.
             * @param {AgentModel} agent
             */
            $scope.onCloneAgent = (agent) => {
                console.log('Clone agent', agent);
            };

            /**
             * Triggers the agent delete process.
             * @param {AgentModel} agent
             */
            $scope.onDeleteAgent = (agent) => {
                console.log('Delete agent', agent);
            };

            /**
             * Handles the selection of a chat.
             * @param {ChatModel} chat
             */
            $scope.onSelectChat = (chat) => {
                TTYGContextService.selectChat(chat);
                $scope.renamedChat = undefined;
            };

            // =========================
            // Subscriptions
            // =========================

            const subscriptions = [];

            const removeAllSubscribers = () => {
                subscriptions.forEach((subscription) => subscription());
            };

            // subscriptions.push(TTYGContextService.onSelectedChatChanged(onSelectedChatChanged));

            // Deregister the watcher when the scope/directive is destroyed
            $scope.$on('$destroy', removeAllSubscribers);

            // =========================
            // Initialization
            // =========================

            function initialize() {
                console.log('AgentListComponent initialized');
            }
            initialize();
        }
    };
}
