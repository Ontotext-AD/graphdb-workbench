export class MonitoringTrackRecord {
    constructor(rawData = {}) {
        /**
         * @type {string}
         */
        this.trackId = rawData.trackId;
        /**
         * @type {string}
         */
        this.trackAlias = rawData.trackAlias;
        /**
         * @type {string}
         */
        this.username = rawData.username;
        /**
         * @type {string}
         */
        this.node = rawData.node;
        /**
         * @type {boolean}
         */
        this.isRequestedToStop  = rawData.isRequestedToStop;
        /**
         * @type {string}
         */
        this.sparqlString = rawData.sparqlString;
        /**
         * @type {string} - the value have to be one of the {@link MonitoringTrackRecordState} options.
         */
        this.state = rawData.state; // create model
        /**
         * @type {string} - the value have to be one of the {@link MonitoringTrackRecordType} options.
         */
        this.type = rawData.type; // create model
        /**
         * @type {number}
         */
        this.numberOfOperations = rawData.numberOfOperations || 0;
        /**
         * @type {number}
         */
        this.msSinceCreated = rawData.msSinceCreated || 0;
        /**
         * @type {string}
         */
        this.humanLifetime = rawData.humanLifetime;
    }
}
