import {cloneDeep} from "lodash";
import {ClusterViewModel} from "../../models/clustermanagement/cluster";

angular
    .module('graphdb.framework.clustermanagement.services.cluster-context', [])
    .factory('ClusterContextService', ClusterContextService);

ClusterContextService.$inject = ['EventEmitterService'];

function ClusterContextService(EventEmitterService) {
    let _clusterView = undefined;
    let _clusterValid = false;

    /**
     * Get the current cluster view.
     * @return {ClusterViewModel|undefined} The current cluster view model or undefined if not set.
     */
    const getClusterView = () => {
        return _clusterView;
    };

    /**
     * Check if the cluster is valid.
     * @return {boolean} True if the cluster is valid, false otherwise.
     */
    const isValid = () => {
        return _clusterValid;
    };

    /**
     * Set the cluster view.
     * @param {Object} clusterView - The cluster view object to set.
     * @return {void}
     */
    const setClusterView = (clusterView) => {
        if (!clusterView) {
            throw new Error("Invalid cluster view object");
        }
        _clusterView = new ClusterViewModel(cloneDeep(clusterView));
        emitUpdateClusterView();
    };

    /**
     * Add a new location (node) to the cluster.
     * @param {ClusterViewModel} clusterView - The current cluster view model.
     * @param {Object} node - The node to add to the cluster.
     * @return {void}
     */
    const addLocation = (clusterView, node) => {
        if (!node || !clusterView) {
            throw new Error("Invalid node or clusterView");
        }
        clusterView.addToCluster(node);
        emitUpdateClusterView();
    };

    /**
     * Update the validity status of the cluster.
     * @param {boolean} valid - True if the cluster is valid, false otherwise.
     * @return {void}
     */
    const updateClusterValidity = (valid) => {
        _clusterValid = valid;
        emit(ClusterEventName.CLUSTER_VALID_UPDATED, isValid());
    };

    /**
     * Subscribe to the cluster view update event.
     * @param {function} callback - The callback to be invoked when the cluster view changes.
     * @return {function} Unsubscribe function to stop listening to the event.
     */
    const onClusterViewChanged = (callback) => {
        if (_clusterView && angular.isFunction(callback)) {
            callback(getClusterView());
        }
        return subscribe(ClusterEventName.CLUSTER_VIEW_UPDATED, (clusterView) => callback(clusterView));
    };

    /**
     * Subscribe to the cluster validity update event.
     * @param {function} callback - The callback to be invoked when the cluster validity changes.
     * @return {function} Unsubscribe function to stop listening to the event.
     */
    const onClusterValidityChanged = (callback) => {
        if (_clusterView && angular.isFunction(callback)) {
            callback(isValid());
        }
        return subscribe(ClusterEventName.CLUSTER_VALID_UPDATED, (validityStatus) => callback(validityStatus));
    };

    /**
     * Emit an update event for the current cluster view.
     * @return {void}
     */
    const emitUpdateClusterView = () => {
        emit(ClusterEventName.CLUSTER_VIEW_UPDATED, getClusterView());
    };

    /**
     * Emit an event with a specified payload.
     * @param {string} clusterEventName - The name of the event to emit.
     * @param {Object} payload - The payload data to emit with the event.
     * @return {void}
     */
    const emit = (clusterEventName, payload) => {
        EventEmitterService.emitSync(clusterEventName, cloneDeep(payload));
    };

    /**
     * Subscribe to an event.
     * @param {string} clusterEventName - The name of the event to subscribe to.
     * @param {function} callback - The callback to invoke when the event is fired.
     * @return {function} Unsubscribe function to stop listening to the event.
     */
    const subscribe = (clusterEventName, callback) => {
        return EventEmitterService.subscribeSync(clusterEventName, (payload) => callback(payload));
    };

    return {
        emit,
        subscribe,
        getClusterView,
        onClusterViewChanged,
        setClusterView,
        addLocation,
        updateClusterValidity,
        isValid,
        onClusterValidityChanged
    };
}

/**
 * Enum for cluster event names.
 * @enum {string}
 */
export const ClusterEventName = {
    CLUSTER_VIEW_UPDATED: 'cluster_view_updated',
    CLUSTER_VALID_UPDATED: 'cluster_valid_updated'
};
