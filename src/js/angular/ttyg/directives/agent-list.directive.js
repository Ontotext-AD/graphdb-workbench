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
             * The selected agents filter.
             * @type {{key: string, label: string}|undefined}
             */
            $scope.selectedAgentsFilter = undefined;

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
             * Handles the selection of an agent.
             * @param {AgentModel} agent
             */
            $scope.onSelectAgent = (agent) => {
                console.log('Select agent', agent);
            };

            /**
             * Filters the agents based on the selected repository.
             * @param {AgentListFilterModel} selectedFilter
             */
            $scope.onAgentsFilterChange = (selectedFilter) => {
                $scope.selectedAgentsFilter = selectedFilter;
                $scope.agentList.filterByRepository($scope.selectedAgentsFilter.key);
            };

            // =========================
            // Private functions
            // =========================

            const updateSelectedAgentsFilter = () => {
                const selectedFilter = $scope.agentListFilterModel.find((filter) => filter.selected);
                $scope.selectedAgentsFilter = selectedFilter || $scope.agentListFilterModel[0];
                $scope.onAgentsFilterChange($scope.selectedAgentsFilter);
            };

            // =========================
            // Subscriptions
            // =========================

            const subscriptions = [];

            const removeAllSubscribers = () => {
                subscriptions.forEach((subscription) => subscription());
            };

            subscriptions.push($scope.$watch('agentListFilterModel', updateSelectedAgentsFilter));

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
