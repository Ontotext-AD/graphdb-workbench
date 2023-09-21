/**
 * DTO that represents the backend meaning of an active operation.
 */
export class ActiveOperationInput {
    constructor() {
        /**
         * Information about an active operation, meaning of value depends on the active operation.
         * For example:
         * <ul>
         *     <li>For queries, update, or imports, the value is a string representation of a number. The number represents the count of operations run.</li>
         *     <li>For cluster operations, the value represents the cluster operation status: IN_SYNC, RECOVERING, OUT_OF_SYNC, UNAVAILABLE_NODES</li>
         *     <li>For backup and restore, the value represents the operation name: CREATE_BACKUP_IN_PROGRESS, RESTORE_BACKUP_IN_PROGRESS, CREATE_CLOUD_BACKUP_IN_PROGRESS, RESTORE_CLOUD_BACKUP_IN_PROGRESS</li>
         * </ul>
         * @type {string}
         */
        this.value = '';

        /**
         *
         * @type {string} - The value must be one of the {@see OPERATION_STATUS} options.
         */
        this.status = '';

        /**
         *
         * @type {string} - The value must be one of the {@see OPERATION_TYPE} options.
         */
        this.type = '';
    }
}
