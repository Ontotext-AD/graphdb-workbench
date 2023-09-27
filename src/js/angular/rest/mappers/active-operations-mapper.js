import {OPERATION_TYPE} from "../../models/monitoring/operations/operation-type";
import {ActiveOperationModel} from "../../models/monitoring/operations/active-operation-model";
import {OPERATION_GROUP_TYPE} from "../../models/monitoring/operations/operation-group";
import {ActiveOperationsModel} from "../../models/monitoring/operations/active-operations-model";
import {OPERATION_MONITORING_CONSTANTS} from "../../models/monitoring/operations/operation-monitoring-constants";

/**
 * Transforms the backend representation of active operations: count of run queries, count of run imports, back and restore ... to UI model.
 *
 * @param {ActiveOperationsInput} activeOperationsResponse
 *
 * @return {ActiveOperationsModel}
 */
export const mapActiveOperationResponseToModel = (activeOperationsResponse) => {
    const activeOperations = new ActiveOperationsModel();
    activeOperations.status = activeOperationsResponse.status;
    activeOperations.operations = getOperations(activeOperationsResponse.allRunningOperations);
    return activeOperations;
};

/**
 *
 * @param {ActiveOperationInput[]} activeOperations
 * @return {ActiveOperationsModel[]}
 */
const getOperations = (activeOperations = []) =>{
    const operations = [];
    activeOperations.forEach((activeOperation) => operations.push(mapActiveOperationToActiveOperationInfoModel(activeOperation)));
    return operations;
};

/**
 * Transforms the backend representation of an active operation: count of run queries, count of run imports, back and restore ... to UI model.
 *
 * @param {ActiveOperationInput} activeOperation
 *
 * @return {ActiveOperationModel}
 */
export const mapActiveOperationToActiveOperationInfoModel = (activeOperation) => {
    switch (activeOperation.type) {
        case OPERATION_TYPE.IMPORTS:
            return mapImportActiveOperationToActiveOperationInfoModel(activeOperation);
        case OPERATION_TYPE.QUERIES:
        case OPERATION_TYPE.UPDATES:
            return mapQueriesActiveOperationToActiveOperationInfoModel(activeOperation);
        case OPERATION_TYPE.BACKUP_RESTORE:
            return mapBackupAndRestoreActiveOperationToActiveOperationInfoModel(activeOperation);
        case OPERATION_TYPE.CLUSTER_STATUS:
            return mapClusterActiveOperationToActiveOperationInfoModel(activeOperation);
    }
};

/**
 * Transforms the backend representation of аn import active operation to {@see ActiveOperationModel}.
 *
 * @param {ActiveOperationInput} activeOperation
 *
 * @return {ActiveOperationModel}
 */
export const mapImportActiveOperationToActiveOperationInfoModel = (activeOperation) => {
    const operation = new ActiveOperationModel();
    operation.operationGroup = OPERATION_GROUP_TYPE.IMPORT_OPERATION;
    operation.runningOperationCount = parseInt(activeOperation.value, 10);
    operation.status = activeOperation.status;
    operation.type = activeOperation.type;
    operation.titleLabelKey = activeOperation.type;
    operation.monitoringViewUrl = OPERATION_MONITORING_CONSTANTS.IMPORT_MONITORING_URL;
    return operation;
};

/**
 * Transforms the backend representation of а query (import, update, queries) active operation to {@see ActiveOperationModel}.
 *
 * @param {ActiveOperationInput} activeOperation
 *
 * @return {ActiveOperationModel}
 */
export const mapQueriesActiveOperationToActiveOperationInfoModel = (activeOperation) => {
    const operation = new ActiveOperationModel();
    operation.operationGroup = OPERATION_GROUP_TYPE.QUERIES_OPERATION;
    operation.runningOperationCount = parseInt(activeOperation.value, 10);
    operation.status = activeOperation.status;
    operation.type = activeOperation.type;
    operation.titleLabelKey = activeOperation.type;
    operation.monitoringViewUrl = OPERATION_MONITORING_CONSTANTS.QUERIES_MONITORING_URL;
    return operation;
};

/**
 * Transforms the backend representation of an active backup and restore operation to {@see ActiveOperationModel}.
 *
 * @param {ActiveOperationInput} activeOperation - sent by backend.
 *
 * @return {ActiveOperationModel}
 */
export const mapBackupAndRestoreActiveOperationToActiveOperationInfoModel = (activeOperation) => {
    const operation = new ActiveOperationModel();
    operation.operationGroup = OPERATION_GROUP_TYPE.BACKUP_AND_RESTORE_OPERATION;
    operation.status = activeOperation.status;
    operation.type = activeOperation.type;
    operation.titleLabelKey = activeOperation.value;
    operation.monitoringViewUrl = OPERATION_MONITORING_CONSTANTS.BACKUP_AND_RESTORE_MONITORING_URL;
    return operation;
};

/**
 * Transforms the backend representation of an active cluster operation to {@see ActiveOperationModel}.
 *
 * @param {ActiveOperationInput} activeOperation
 *
 * @return {ActiveOperationModel}
 */
export const mapClusterActiveOperationToActiveOperationInfoModel = (activeOperation) => {
    const operation = new ActiveOperationModel();
    operation.operationGroup = OPERATION_GROUP_TYPE.CLUSTER_OPERATION;
    operation.status = activeOperation.status;
    operation.type = activeOperation.type;
    operation.titleLabelKey = activeOperation.value;
    operation.monitoringViewUrl = OPERATION_MONITORING_CONSTANTS.CLUSTER_MONITORING_URL;
    return operation;
};
