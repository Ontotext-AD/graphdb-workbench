import {OPERATION_GROUP_TYPE} from "../../../models/monitoring/operations/operation-group";
import {OPERATION_STATUS} from "../../../models/monitoring/operations/operation-status";
import {
    OPERATION_TYPE,
    OPERATION_TYPE_SORT_ORDER
} from "../../../models/monitoring/operations/operation-type";
import {SequenceGeneratorUtil} from "../../../utils/sequence-generator-util";

const UPDATE_ACTIVE_OPERATION_TIME_INTERVAL = 2000;

angular.module('graphdb.framework.core.directives.operationsstatusesmonitor', [])
    .directive('operationsStatusesMonitor', operationsStatusesMonitorDirectives);

operationsStatusesMonitorDirectives.$inject = ['$interval', '$repositories', 'MonitoringRestService', '$jwtAuth'];

function operationsStatusesMonitorDirectives($interval, $repositories, MonitoringRestService, $jwtAuth) {

    return {
        restrict: 'E',
        templateUrl: 'js/angular/core/directives/operations-statuses-monitor/templates/operations-statuses-monitor.html',
        link: linkFunc
    };

    function linkFunc(scope) {
        scope.OPERATION_STATUS = OPERATION_STATUS;
        scope.OPERATION_GROUP_TYPE = OPERATION_GROUP_TYPE;
        scope.OPERATION_TYPE = OPERATION_TYPE;
        scope.activeOperations = undefined;

        let updateActiveOperationsTimer = undefined;
        let updateActiveRepositoryRun = false;
        let skipUpdateActiveOperationsTimes = 0;
        const fibonacciGenerator = SequenceGeneratorUtil.getFibonacciSequenceGenerator();

        // =========================
        // Private functions
        // =========================

        /**
         * Calculates count of active operations in the entire group depending on <code>operationGroupType</code>.
         * @param {string} operationGroupType - the value must be one of {@see OPERATION_GROUP_TYPE} options.
         * @return {number}
         */
        const getOperationGroupRunningCount = (operationGroupType) => {
            if (scope.activeOperations.operations) {
                return scope.activeOperations.operations.reduce((runningOperation, operationStatus) => {
                    if (operationGroupType !== operationStatus.operationGroup) {
                        return runningOperation;
                    }

                    return runningOperation + operationStatus.runningOperationCount;
                }, 0);
            }
        };

        /**
         *
         * @param {ActiveOperationsModel} newActiveOperations - new active operations.
         */
        const updateActiveOperations = (newActiveOperations) => {
            if (angular.equals(scope.activeOperations, newActiveOperations)) {
                return;
            }
            scope.activeOperations = newActiveOperations;

            scope.activeOperations.operations.forEach((op) => {
                op.groupRunningOperationCount = getOperationGroupRunningCount(op.operationGroup);
            });

            scope.activeOperations.operations.sort((a, b) => {
                return OPERATION_TYPE_SORT_ORDER[a.type] - OPERATION_TYPE_SORT_ORDER[b.type];
            });
        };

        const reloadActiveOperations = () => {
            if (!$jwtAuth.isAuthenticated() || updateActiveRepositoryRun) {
                scope.activeOperations = undefined;
                return;
            }

            if (skipUpdateActiveOperationsTimes > 0) {
                // Requested to skip this run, the number of skips is a Fibonacci sequence when errors are consecutive.
                skipUpdateActiveOperationsTimes--;
                return;
            }

            const activeRepository = $repositories.getActiveRepository();
            if (!activeRepository) {
                return;
            }
            MonitoringRestService.monitorActiveOperations(activeRepository)
                .then((activeOperations) => {
                    updateActiveOperations(activeOperations);
                    fibonacciGenerator.reset();
                    skipUpdateActiveOperationsTimes = 0;
                })
                .catch(() => skipUpdateActiveOperationsTimes = fibonacciGenerator.next())
                .finally(() => updateActiveRepositoryRun = false);

        };

        // =========================
        // Subscriptions
        // =========================

        const removeAllSubscribers = () => {
            if (updateActiveOperationsTimer) {
                $interval.cancel(updateActiveOperationsTimer);
            }
        };

        // Deregister the watcher when the scope/directive is destroyed
        scope.$on('$destroy', removeAllSubscribers);

        reloadActiveOperations();
        updateActiveOperationsTimer = $interval(() => reloadActiveOperations(), UPDATE_ACTIVE_OPERATION_TIME_INTERVAL);
    }
}
