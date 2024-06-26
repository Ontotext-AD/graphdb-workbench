import {OPERATION_STATUS} from "./operation-status";
import {OPERATION_GROUP_TYPE} from "./operation-group";

export class ActiveOperationsModel {
    constructor() {
        /**
         *
         * @type {ActiveOperationModel[]}
         */
        this.operations = [];
        this.status = OPERATION_STATUS.INFORMATION;
    }

    hasClusterOperation() {
        if (this.operations) {
            return this.operations.some((operation) => OPERATION_GROUP_TYPE.CLUSTER_OPERATION === operation.operationGroup);
        }
        return false;
    }
}
