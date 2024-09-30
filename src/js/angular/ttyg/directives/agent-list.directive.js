import {decodeHTML} from "../../../../app";
import {TTYGEventName} from "../services/ttyg-context.service";

const modules = [
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
            agentList: '=',
            agentListFilterModel: '='
        },
        link: ($scope, element, attrs) => {

            // =========================
            // Public variables
            // =========================

            /**
             * Selected agent.
             * @type {AgentModel|undefined}
             */
            $scope.selectedAgent = undefined;

            /**
             * The selected agents filter.
             * @type {{key: string, label: string}|undefined}
             */
            $scope.selectedAgentsFilter = undefined;

            /**
             * An event instance holding the agent to be deleted and if the progres is ongoing.
             * @type {agentId: string, inProgress: boolean}
             */
            $scope.deletingAgent = undefined;

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
                TTYGContextService.emit(TTYGEventName.EDIT_AGENT, agent);
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
                const title = $translate.instant('ttyg.agent.delete_agent_modal.title');
                const confirmDeleteMessage = decodeHTML($translate.instant('ttyg.agent.delete_agent_modal.body', {agentName: agent.name}));
                ModalService.openConfirmation(title, confirmDeleteMessage, () => TTYGContextService.emit(TTYGEventName.DELETE_AGENT, agent));
            };

            /**
             * Filters the agents based on the selected repository.
             * @param {AgentListFilterModel} selectedFilter
             */
            $scope.onAgentsFilterChange = (selectedFilter) => {
                $scope.selectedAgentsFilter = selectedFilter;
                if ($scope.selectedAgentsFilter) {
                    $scope.agentList.filterByRepository($scope.selectedAgentsFilter.key);
                }
            };

            // =========================
            // Private functions
            // =========================

            const updateSelectedAgentsFilter = () => {
                const selectedFilter = $scope.agentListFilterModel.find((filter) => filter.selected);
                $scope.selectedAgentsFilter = selectedFilter || $scope.agentListFilterModel[0];
                $scope.onAgentsFilterChange($scope.selectedAgentsFilter);
            };

            /**
             * Handles the progress of deletion of an agent.
             * @param {{agentId: string, inProgress: boolean}} event
             */
            const onDeletingAgent = (event) => {
                $scope.deletingAgent = event;
            };

            /**
             * Handles the selection of an agent.
             * @param {AgentModel} agent
             */
            const onSelectedAgentChanged = (agent) => {
                $scope.selectedAgent = agent;
            };

            // =========================
            // Subscriptions
            // =========================

            const subscriptions = [];

            const removeAllSubscribers = () => {
                subscriptions.forEach((subscription) => subscription());
            };

            subscriptions.push($scope.$watch('agentListFilterModel', updateSelectedAgentsFilter));
            subscriptions.push(TTYGContextService.subscribe(TTYGEventName.DELETING_AGENT, onDeletingAgent));
            subscriptions.push(TTYGContextService.onSelectedAgentChanged(onSelectedAgentChanged));

            // Deregister the watcher when the scope/directive is destroyed
            $scope.$on('$destroy', removeAllSubscribers);

            // =========================
            // Initialization
            // =========================

            function initialize() {
                updateSelectedAgentsFilter();
            }
            initialize();
        }
    };
}
