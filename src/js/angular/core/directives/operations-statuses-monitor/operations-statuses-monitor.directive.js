import {OPERATION_GROUP_TYPE} from "../../../models/monitoring/operations/operation-group";
import {OPERATION_STATUS, OPERATION_STATUS_SORT_ORDER} from "../../../models/monitoring/operations/operation-status";
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
            return new OperationGroupSummary(operationGroupType, runningOperations, getSummaryGroupOperationStatus(operationGroupType));
        };

        /**
         * Calculates count of active operations depending on <code>operationGroupType</code>.
         * @param {string} operationGroupType - the value must be one of {@see OPERATION_GROUP_TYPE} options.
         * @return {number}
         */
        const getOperationRunningCount = (operationGroupType) => {
            if (scope.activeOperations.operations) {
                return scope.activeOperations.operations.reduce((runningOperation, operationStatus) => {
                    // we skip the cluster and backup_and_restore operations because we do not support multiple operations of that type.
                    if (operationGroupType !== operationStatus.operationGroup || OPERATION_GROUP_TYPE.CLUSTER_OPERATION === operationStatus.operationGroup || OPERATION_GROUP_TYPE.BACKUP_AND_RESTORE_OPERATION === operationStatus.operationGroup) {
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

        const getSummaryGroupOperationStatus = (operationGroupType) => {
            return scope.activeOperations.operations.reduce((groupStatus, operationStatus) => {
                if (operationGroupType !== operationStatus.operationGroup) {
                    return groupStatus;
                }

                if (OPERATION_STATUS_SORT_ORDER.getOrder(operationStatus.status) > OPERATION_STATUS_SORT_ORDER.getOrder(groupStatus)) {
                    return operationStatus.status;
                }
               return groupStatus;
            }, OPERATION_STATUS.INFORMATION);
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

            scope.activeOperations.operations.sort((a, b) => {
                return OPERATION_TYPE_SORT_ORDER[a.type] - OPERATION_TYPE_SORT_ORDER[b.type];
            });

            const operationsStatusesSummary = [];
            const processedGroup = [];
            scope.activeOperations.operations.forEach((operation) => {
                const groupType = operation.operationGroup;
                if (!processedGroup.includes(groupType)) {
                    processedGroup.push(groupType);
                    operationsStatusesSummary.push(getOperationGroupSummary(groupType));
                }
            });
            scope.operationsSummary = operationsStatusesSummary;

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

class OperationGroupSummary {
    constructor(operationGroup, runningOperations, status) {
        this.type = operationGroup;
        this.runningOperations = runningOperations;
        this.status = status;
    }
}
