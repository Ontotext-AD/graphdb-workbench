export const OPERATION_STATUS = {
    'CRITICAL': 'CRITICAL',
    'WARNING': 'WARNING',
    'INFORMATION': 'INFORMATION'
};

export const OPERATION_STATUS_SORT_ORDER = {
    'INFORMATION': 0,
    'WARNING': 1,
    'CRITICAL': 2,
    /**
     *
     * @param {string} operationStatus - the value must be one of the {@see OPERATION_STATUS} option.
     *
     * @return {number} the order of operation status.
     */
    'getOrder': (operationStatus) => {
        switch (operationStatus) {
            case OPERATION_STATUS.WARNING:
                return OPERATION_STATUS_SORT_ORDER.WARNING;
            case OPERATION_STATUS.CRITICAL:
                return OPERATION_STATUS_SORT_ORDER.CRITICAL;
            default:
                return OPERATION_STATUS_SORT_ORDER.INFORMATION;
        }
    }
};
