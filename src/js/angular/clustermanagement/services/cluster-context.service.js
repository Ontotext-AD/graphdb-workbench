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

    /**
     * Set the pending replacement operation.
     * @param {Object} pendingReplace - The pending replacement operation data.
     * @return {void}
     */
    const setPendingReplace = (pendingReplace) => {
        _pendingReplace = cloneDeep(pendingReplace);
    };

    /**
     * Get the pending replacement operation.
     * @return {Object|undefined} The pending replacement operation data or undefined if not set.
     */
    const getPendingReplace = () => {
        return _pendingReplace;
    };

    /**
     * Get the list of items marked for deletion from the cluster.
     * @return {Node[]|Location[]} The list of items marked for deletion.
     */
    const getDeleteFromCluster = () => {
        return _clusterView.getDeleteFromCluster();
    };

    /**
     * Check if the current node count is valid.
     * @return {boolean} True if the node count is valid, false otherwise.
     */
    const hasValidNodesCount = () => {
        return _clusterView.hasValidNodesCount();
    };

    /**
     * Check if a node can be deleted while maintaining a valid node count.
     * @return {boolean} True if a node can be deleted, false otherwise.
     */
    const canDeleteNode = () => {
        return _clusterView.canDeleteNode();
    };

    /**
     * Get the available locations that can be added to the cluster.
     * @return {Location[]} The list of available locations.
     */
    const getAvailable = () => {
        return _clusterView.getAvailable();
    };

    /**
     * Get the available node endpoints that are not yet part of the cluster.
     * @return {string[]} The list of available node endpoints.
     */
    const getAvailableNodeEndpoints = () => {
        return _clusterView.getAvailableNodeEndpoints();
    };

    /**
     * Get the list of attached nodes in the cluster.
     * @return {Location[]} The list of attached nodes.
     */
    const getAttached = () => {
        return _clusterView.getAttached();
    };

    /**
     * Get the cluster configuration.
     * @return {ClusterConfiguration} The current cluster configuration.
     */
    const getClusterConfiguration = () => {
        return _clusterView.getClusterConfiguration();
    };

    /**
     * Find an item in a list by its endpoint.
     * @param {Node[]|Location[]} list - The list of nodes or locations to search.
     * @param {string} endpoint - The endpoint to search for.
     * @return {Node|Location|undefined} The found item or undefined if not found.
     */
    const findByEndpoint = (list, endpoint) => {
        return _clusterView.findByEndpoint(list, endpoint);
    };

    /**
     * Get the view model of the current cluster.
     * @return {ClusterItemViewModel[]} The view model of the cluster.
     */
    const getViewModel = () => {
        return _clusterView.getViewModel();
    };

    /**
     * Checks if the cluster is present or not.
     * @return {boolean} True if the cluster exists, false otherwise.
     */
    const hasCluster = () => {
        return _clusterView.hasCluster();
    };

    /**
     * Get the local node from the cluster.
     * @return {Location|undefined} The local node location or undefined if not found.
     */
    const getLocalNode = () => {
        return _clusterView.getLocalNode();
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
        EventEmitterService.emitSync(clusterEventName, payload);
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
        getPendingReplace,
        getDeleteFromCluster,
        getAvailable,
        getAvailableNodeEndpoints,
        getAttached,
        hasValidNodesCount,
        canDeleteNode,
        findByEndpoint,
        getLocalNode,
        getViewModel,
        hasCluster,
        getClusterConfiguration
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
