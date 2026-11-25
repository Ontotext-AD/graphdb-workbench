import {MonitoringTrackRecordState} from './monitoring-track-record-state';

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
        /**
         * @type {boolean}
         */
        this.isClusterReplicating = this.state === MonitoringTrackRecordState.CLUSTER_REPLICATING;
        /**
         * @type {boolean}
         */
        this.canAbort = !this.isRequestedToStop && !this.isClusterReplicating;
        /**
         * The translation key of the Abort button's popover.
         * @type {string}
         */
        this.abortPopoverKey = getAbortPopoverKey(this);
    }
}

/**
 * Returns the translation key of the Abort button's popover for the record's type and state.
 * @param {MonitoringTrackRecord} record
 * @return {string}
 */
function getAbortPopoverKey(record) {
    const isQuery = record.type === 'QUERY';
    if (record.isClusterReplicating) {
        return 'update.cluster_replicating';
    }
    if (record.isRequestedToStop) {
        return isQuery ? 'query.abort.request' : 'update.requested';
    }
    return isQuery ? 'click.to.abort.query' : 'click.to.abort.update';
}
