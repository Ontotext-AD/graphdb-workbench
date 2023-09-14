import {OPERATION_STATUS} from "./operation-status";

/**
 * DTO that represents the model of all active operations e.k. import queries, update queries, backup and restore ... .
 */
export class ActiveOperationsInput {
    constructor() {
        /**
         *
         * @type {ActiveOperationInput[]}
         */
        this.allRunningOperations = [];
        this.status = OPERATION_STATUS.INFORMATION;
    }
}
