import {cloneDeep} from "lodash";
import {ClusterViewModel} from "../../models/clustermanagement/cluster";

angular
    .module('graphdb.framework.clustermanagement.services.cluster-context', [])
    .factory('ClusterContextService', ClusterContextService);

ClusterContextService.$inject = ['EventEmitterService'];

function ClusterContextService(EventEmitterService) {
    let _clusterView = undefined;
    let _clusterValid = false;
    let _pendingReplace = undefined;

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
     * Add a new location to the cluster.
     * @param {Location} location - The node to add to the cluster.
     * @return {void}
     */
    const addLocation = (location) => {
        if (!location) {
            throw new Error("Invalid location");
        }
        _clusterView.addToCluster(location);
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
     * Marks an item for deletion from the cluster.
     * @param {Node|Location} itemToDelete - The item to delete. This can either be a Node or a Location object.
     * @throws {Error} Throws an error if the item to delete is not provided or invalid.
     * @return {void}
     */
    const deleteFromCluster = (itemToDelete) => {
        if (!itemToDelete) {
            throw new Error("Invalid node");
        }
        _clusterView.deleteFromCluster(itemToDelete);
        emitUpdateClusterView();
    };

    /**
     * Restores a previously deleted node back into the cluster.
     * @param {Node} node - The node to restore.
     * @throws {Error} Throws an error if the node is not provided or invalid.
     * @return {void}
     */
    const restoreNode = (node) => {
        if (!node) {
            throw new Error("Invalid node");
        }

        _clusterView.restoreFromDeletion(node);
        emitUpdateClusterView();
    };

    /**
     * Replaces node or location with a new location the cluster.
     * @param {Node|Location} oldItem - The node to be replaced.
     * @param {Location} newLocation - The new location.
     * @return {void}
     */
    const replace = (oldItem, newLocation) => {
        deleteFromCluster(oldItem);
        addLocation(newLocation);
    };

    const setPendingReplace = (pendingReplace) => {
        _pendingReplace = cloneDeep(pendingReplace);
    };

    const getPendingReplace = () => {
        return _pendingReplace;
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
        onClusterValidityChanged,
        emitUpdateClusterView,
        deleteFromCluster,
        restoreNode,
        replace,
        setPendingReplace,
        getPendingReplace
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
