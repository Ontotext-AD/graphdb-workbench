import {OPERATION_STATUS} from "./operation-status";

export class ActiveOperationsModel {
    constructor() {
        /**
         *
         * @type {ActiveOperationsModel[]}
         */
        this.operations = [];
        this.status = OPERATION_STATUS.INFORMATION;
    }
}
