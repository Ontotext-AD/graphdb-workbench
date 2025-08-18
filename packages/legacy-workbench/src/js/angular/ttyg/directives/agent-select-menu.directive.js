import {SelectMenuOptionsModel} from "../../models/form-fields";
import {TTYGEventName} from "../services/ttyg-context.service";

const modules = [
];

angular
    .module('graphdb.framework.ttyg.directives.agent-select-menu', modules)
    .directive('agentSelectMenu', AgentSelectMenuComponent);

AgentSelectMenuComponent.$inject = ['TTYGContextService', '$translate', '$sce', 'ModalService', 'TTYGStorageService'];

function AgentSelectMenuComponent(TTYGContextService, $translate, $sce, ModalService, TTYGStorageService) {
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
             * @param {Event} $event - The DOM event triggered by the selection.
             * @param {AgentModel} agent - The selected agent instance.
             */
            $scope.onAgentSelected = ($event, agent) => {
                if (!agent.isCompatible) {
                    // Prevents the dropdown from closing if the selected agent is not compatible
                    // by stopping event propagation and preventing the default action.
                    $event.stopPropagation();
                    $event.preventDefault();
                    return;
                }
                markAsSelected(agent);
                TTYGStorageService.saveAgent(agent);
                $scope.selectedAgent = agent;
                TTYGContextService.selectAgent(agent);
                if (agent.isRepositoryDeleted) {
                    const title = $translate.instant('ttyg.agent.agent_select_menu.configure_agent_modal.title');
                    const confirmMessage = $translate.instant('ttyg.agent.agent_select_menu.configure_agent_modal.body');
                    ModalService.openConfirmation(title, confirmMessage,
                        () => TTYGContextService.emit(TTYGEventName.EDIT_AGENT, agent)
                    );
                }
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
                selectLastUsedOrDefaultAgent();
            };

            /**
             * Function to select the most recently used agent (according to local store) or selects the first in the list
             * if no recent agent is available.
             *
             * @function
             */
            const selectLastUsedOrDefaultAgent = () => {
                let selectedAgent;
                const storedAgentId = TTYGStorageService.getAgentId();

                if (storedAgentId) {
                    // If saved in the LocalStore, the user has selected it, so select it here
                    $scope.agentOptionsList.forEach((agent) => {
                        if (agent.data.agent.id === storedAgentId) {
                            selectedAgent = agent.data.agent
                        }
                    });
                }

                // Otherwise, select the first in the option list
                if (!selectedAgent && $scope.agentOptionsList[0]) {
                    selectedAgent = $scope.agentOptionsList[0].data.agent;
                }
                onSelectedAgentChanged(selectedAgent);
                TTYGContextService.selectAgent(selectedAgent);
            }

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
