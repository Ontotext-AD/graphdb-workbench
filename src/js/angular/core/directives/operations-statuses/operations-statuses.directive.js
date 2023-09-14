import {OPERATION_GROUP_TYPE} from "../../../models/monitoring/operations/operation-group";
import {OPERATION_STATUS} from "../../../models/monitoring/operations/operation-status";
import {OPERATION_TYPE} from "../../../models/monitoring/operations/operation-type";

angular.module('graphdb.framework.core.directives.operationsstatuses', [])
    .directive('operationsStatuses', operationsStatusesDirectives);

operationsStatusesDirectives.$inject = ['$location'];

function operationsStatusesDirectives($location) {

    return {
        restrict: 'E',
        templateUrl: 'js/angular/core/directives/operations-statuses/templates/operations-statuses.html',
        link: linkFunc,
        scope: {
            activeOperations: '='
        }
    };

    function linkFunc(scope) {
        scope.OPERATION_STATUS = OPERATION_STATUS;
        scope.OPERATION_GROUP_TYPE = OPERATION_GROUP_TYPE;
        scope.OPERATION_TYPE = OPERATION_TYPE;
        scope.operationsSummary = {};

        // =========================
        // Public functions
        // =========================
        /**
         * Getters for monitoring view url depending on <code>operationGroupType</code>.

         * @param {string} operationGroupType - the value must be one of {@see OPERATION_GROUP_TYPE} options.
         *
         * @return {string} the url of the monitoring view.
         */
        scope.getOperationUrl = (operationGroupType) => {
            if (OPERATION_GROUP_TYPE.QUERIES_OPERATION === operationGroupType) {
                return 'monitor/queries';
            }

            if (OPERATION_GROUP_TYPE.BACKUP_AND_RESTORE_OPERATION === operationGroupType) {
                return 'monitor/backup-and-restore';
            }

            if (OPERATION_GROUP_TYPE.CLUSTER_OPERATION === operationGroupType) {
                return 'cluster';
            }
        };

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

                    if (OPERATION_GROUP_TYPE.QUERIES_OPERATION === operationStatus.operationGroup) {
                        return runningOperation + operationStatus.runningOperationCount;
                    } else {
                        return runningOperation + 1;
                    }
                }, 0);
            }
        };

        // =========================
        // Subscriptions
        // =========================

        /**
         * Handler of active operation changes.
         *
         * @param {ActiveOperationsModel} newValue
         * @param {ActiveOperationsModel} oldValue
         */
        const activeOperationsHandler = (newValue, oldValue) => {
            if (angular.equals(newValue, oldValue)) {
                return;
            }
            const operationsStatusesSummary = [];
            operationsStatusesSummary.push(getOperationGroupSummary(OPERATION_GROUP_TYPE.QUERIES_OPERATION));
            operationsStatusesSummary.push(getOperationGroupSummary(OPERATION_GROUP_TYPE.BACKUP_AND_RESTORE_OPERATION));
            operationsStatusesSummary.push(getOperationGroupSummary(OPERATION_GROUP_TYPE.CLUSTER_OPERATION));
            scope.operationsSummary = operationsStatusesSummary;
        };

        const subscriptions = [];
        subscriptions.push(scope.$watch('activeOperations', activeOperationsHandler));

        const removeAllSubscribers = () => {
            subscriptions.forEach((subscription) => subscription());
        };

        // Deregister the watcher when the scope/directive is destroyed
        scope.$on('$destroy', removeAllSubscribers);
    }
}

class OperationGroupSummary {
    constructor(operationGroup, runningOperations) {
        this.type = operationGroup;
        this.runningOperations = runningOperations;
    }
}
