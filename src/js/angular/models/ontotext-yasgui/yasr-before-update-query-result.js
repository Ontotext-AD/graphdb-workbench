export class YasrBeforeUpdateQueryResult {
    constructor() {

        /**
         * @type {string} - the value have to be one of the {@link QueryResponseStatus} options.
         */
        this.status = undefined;

        /**
         * @type {string}
         */
        this.message = undefined;

        /**
         * @type {string}
         */
        this.messageLabelKey = undefined;

        /**
         * @type {{[parameterName: string]: string}}
         */
        this.parameters = undefined;
    }
}
