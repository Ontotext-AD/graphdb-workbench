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
             * @param {AgentModel} agent
             */
            $scope.onAgentSelected = (agent) => {
                markAsSelected(agent);
                $scope.selectedAgent = agent;
                TTYGContextService.selectAgent(agent);
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
                TTYGContextService.selectAgent(selectedAgentOption.data.agent);
            };

            // =========================
            // Private functions
            // =========================

            /**
             * Marks the given agent as selected and deselects the rest.
             * @param {AgentModel} agent
             */
            const markAsSelected = (agent) => {
                $scope.agentOptionsList.forEach((agentOption) => {
                    agentOption.selected = agentOption.data.agent === agent;
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
                    TTYGContextService.selectAgent($scope.selectedAgent);
                }
            };

            /**
             * Handles the selection of an agent. When an agent is selected by the user from this menu, the agent is then
             * saved in the local storage. When the TTYG view is initialized, the selected agent is retrieved from the
             * local and its details loaded through the API. Then this component is updated to reflect the selected agent.
             * @param {AgentModel} agent
             */
            const onSelectedAgentChanged = (agent) => {
                markAsSelected(agent);
                $scope.selectedAgent = agent;
            };

            /**
             * Builds the agent options model which is used to display the agents in the select menu.
             * @param {AgentListModel} agentsListModel
             */
            const buildAgentOptionsModel = (agentsListModel) => {
                $scope.agentOptionsList = agentsListModel.agents.map((agent) => {
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

            subscriptions.push(TTYGContextService.onAgentsListChanged(onAgentListChanged));
            subscriptions.push(TTYGContextService.subscribe(TTYGEventName.AGENT_DELETED, onAgentDeleted));
            subscriptions.push(TTYGContextService.onSelectedAgentChanged(onSelectedAgentChanged));
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
