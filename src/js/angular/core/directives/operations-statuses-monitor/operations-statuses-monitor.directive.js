import {OPERATION_GROUP_TYPE} from "../../../models/monitoring/operations/operation-group";
import {OPERATION_STATUS} from "../../../models/monitoring/operations/operation-status";
import {OPERATION_TYPE} from "../../../models/monitoring/operations/operation-type";
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
        scope.operationsSummary = undefined;
        scope.activeOperations = undefined;

        let updateActiveOperationsTimer = undefined;
        let updateActiveRepositoryRun = false;
        let skipUpdateActiveOperationsTimes = 0;
        const fibonacciGenerator = SequenceGeneratorUtil.getFibonacciSequenceGenerator();

        // =========================
        // Private functions
        // =========================

        /**
         *
         * @param {string} operationGroupType - the value must be one of {@see OPERATION_GROUP_TYPE} options.
         * @return {OperationGroupSummary}
         */
        const getOperationGroupSummary = (operationGroupType) => {
            const runningOperations = getOperationRunningCount(operationGroupType);
            return new OperationGroupSummary(operationGroupType, runningOperations);
        };

        /**
         * Calculates count of active operations depending on <code>operationGroupType</code>.
         * @param {string} operationGroupType - the value must be one of {@see OPERATION_GROUP_TYPE} options.
         * @return {number}
         */
        const getOperationRunningCount = (operationGroupType) => {
            if (scope.activeOperations.operations) {
                return scope.activeOperations.operations.reduce((runningOperation, operationStatus) => {
                    if (operationGroupType !== operationStatus.operationGroup) {
                        return runningOperation;
                    }

                    if (OPERATION_GROUP_TYPE.QUERIES_OPERATION === operationStatus.operationGroup || OPERATION_GROUP_TYPE.IMPORT_OPERATION === operationStatus.operationGroup) {
                        return runningOperation + operationStatus.runningOperationCount;
                    } else {
                        return runningOperation + 1;
                    }
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
            const operationsStatusesSummary = [];
            operationsStatusesSummary.push(getOperationGroupSummary(OPERATION_GROUP_TYPE.IMPORT_OPERATION));
            operationsStatusesSummary.push(getOperationGroupSummary(OPERATION_GROUP_TYPE.QUERIES_OPERATION));
            operationsStatusesSummary.push(getOperationGroupSummary(OPERATION_GROUP_TYPE.BACKUP_AND_RESTORE_OPERATION));
            operationsStatusesSummary.push(getOperationGroupSummary(OPERATION_GROUP_TYPE.CLUSTER_OPERATION));
            scope.operationsSummary = operationsStatusesSummary;
        };

        const reloadActiveOperations = () => {
            if (!$jwtAuth.isAuthenticated() || updateActiveRepositoryRun) {
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

class OperationGroupSummary {
    constructor(operationGroup, runningOperations) {
        this.type = operationGroup;
        this.runningOperations = runningOperations;
    }
}
