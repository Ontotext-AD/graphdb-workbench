import {SelectMenuOptionsModel} from "../../models/form-fields";
import {TTYGEventName} from "../services/ttyg-context.service";

const modules = [
];

angular
    .module('graphdb.framework.ttyg.directives.agent-select-menu', modules)
    .directive('agentSelectMenu', AgentSelectMenuComponent);

AgentSelectMenuComponent.$inject = ['TTYGContextService', '$translate', '$sce', 'ModalService'];

function AgentSelectMenuComponent(TTYGContextService, $translate, $sce, ModalService) {
    return {
        restrict: 'E',
        templateUrl: 'js/angular/ttyg/templates/agent-select-menu.html',
        scope: {
        },
        link: ($scope) => {

            // =========================
            // Public variables
            // =========================

            $scope.agentOptionsList = [];

            /**
             * Selected agent ID.
             * @type {AgentModel|undefined}
             */
            $scope.selectedAgent = undefined;

            // =========================
            // Private variables
            // =========================

            // =========================
            // Public functions
            // =========================

            /**
             * Handles the agent selection.
             * @param {SelectMenuOptionsModel} selectedAgentOption
             */
            $scope.onAgentSelected = (selectedAgentOption) => {
                markAsSelected(selectedAgentOption);
                $scope.selectedAgent = selectedAgentOption.data.agent;
                TTYGContextService.emit(TTYGEventName.AGENT_SELECTED, selectedAgentOption.data.agent);
            };

            /**
             * Handles the selection of an agent without a repository.
             * @param {SelectMenuOptionsModel} selectedAgentOption
             */
            $scope.onAgentWithoutRepoSelected = (selectedAgentOption) => {
                const title = $translate.instant('ttyg.agent.agent_select_menu.configure_agent_modal.title');
                const confirmMessage = $translate.instant('ttyg.agent.agent_select_menu.configure_agent_modal.body');
                ModalService.openConfirmation(title, confirmMessage,
                    () => TTYGContextService.emit(TTYGEventName.EDIT_AGENT, selectedAgentOption.data.agent)
                );
                markAsSelected(selectedAgentOption);
                $scope.selectedAgent = selectedAgentOption.data.agent;
                TTYGContextService.emit(TTYGEventName.AGENT_SELECTED, selectedAgentOption.data.agent);
            };

            // =========================
            // Private functions
            // =========================

            const markAsSelected = (selectedAgentOption) => {
                $scope.agentOptionsList.forEach((agentOption) => {
                    agentOption.selected = agentOption === selectedAgentOption;
                });
            };

            /**
             * Handles the agent list change event.
             * @param {AgentListModel} agents
             */
            const onAgentListChanged = (agents) => {
                buildAgentOptionsModel(agents);
            };

            /**
             * Handles the agent deleted event.
             * @param {AgentModel} deletedAgent - the deleted agent
             */
            const onAgentDeleted = (deletedAgent) => {
                if ($scope.selectedAgent && $scope.selectedAgent.id === deletedAgent.id) {
                    $scope.selectedAgent.isDeleted = true;
                }
            };

            const buildAgentOptionsModel = (agents) => {
                $scope.agentOptionsList = agents.agents.map((agent) => {
                    return new SelectMenuOptionsModel({
                        value: agent.id,
                        label: agent.name,
                        data: {
                            agent: agent
                        }
                    });
                });
            };

            // =========================
            // Subscriptions
            // =========================

            const subscriptions = [];

            const removeAllSubscribers = () => {
                subscriptions.forEach((subscription) => subscription());
            };

            subscriptions.push(TTYGContextService.subscribe(TTYGEventName.AGENT_LIST_UPDATED, onAgentListChanged));
            subscriptions.push(TTYGContextService.subscribe(TTYGEventName.AGENT_DELETED, onAgentDeleted));
            // Deregister the watcher when the scope/directive is destroyed
            $scope.$on('$destroy', removeAllSubscribers);

            // =========================
            // Initialization
            // =========================

            function initialize() {
                // buildAgentOptionsModel();
            }
            initialize();
        }
    };
}
