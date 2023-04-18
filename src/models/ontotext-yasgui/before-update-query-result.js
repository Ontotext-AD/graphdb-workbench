export class BeforeUpdateQueryResult {
    constructor(status, messageLabelKey, parameters, mesage) {
        this.status = status;
        this.mesage = mesage;
        this.messageLabelKey = messageLabelKey;
        this.parameters = parameters;
    }
}

export const BeforeUpdateQueryResultStatus = {
    ERROR: 'error',
    SUCCESS: 'success'
};
