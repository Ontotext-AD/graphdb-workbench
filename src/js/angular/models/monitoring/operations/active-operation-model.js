import {OPERATION_STATUS} from "./operation-status";

/**
 * UI representation of an active operation: count of query, count of imports, backup and restore... .
 */
export class ActiveOperationModel {
    constructor() {
        /**
         * @type {string} - the value must be one of the {@see OPERATION_GROUP_TYPE} option.
         */
        this.operationGroup = undefined;
        this.runningOperationCount = 0;
        this.groupRunningOperationCount = 0;
        this.status = OPERATION_STATUS.INFORMATION;
        this.type = undefined;
        this.titleLabelKey = '';
        this.monitoringViewUrl = '';
    }
}
