import {value} from "lodash/seq";

/**
 * Represents a location with relevant metadata.
 */
export class Location {
    /**
     * @param {string} endpoint - The endpoint of the location.
     * @param {string} rpcAddress - The RPC address of the location.
     * @param {string} error - Any error associated with the location.
     * @param {boolean} isAvailable - Whether the location is available.
     * @param {boolean} isLocal - Whether the location is local.
     */
    constructor(endpoint, rpcAddress, error = null, isAvailable = false, isLocal = false) {
        this._endpoint = endpoint;
        this._rpcAddress = rpcAddress;
        this._error = error;
        this._isAvailable = isAvailable;
        this._isLocal = isLocal;
    }

    /** @return {boolean} Whether the location is local. */
    get isLocal() {
        return this._isLocal;
    }

    /** @return {string} The endpoint of the location. */
    get endpoint() {
        return this._endpoint;
    }

    /** @return {string} The RPC address of the location. */
    get rpcAddress() {
        return this._rpcAddress;
    }

    /** @return {string} Any error related to the location. */
    get error() {
        return this._error;
    }

    /** @return {boolean} Whether the location is available. */
    get isAvailable() {
        return this._isAvailable;
    }

    set endpoint(value) {
        this._endpoint = value;
    }

    set rpcAddress(value) {
        this._rpcAddress = value;
    }

    set error(value) {
        this._error = value;
    }

    set isAvailable(value) {
        this._isAvailable = value;
    }

    set isLocal(value) {
        this._isLocal = value;
    }

    /**
     * Maps JSON data to a Location instance.
     * @param {Object} json - The JSON data.
     * @return {Location} The mapped Location instance.
     */
    static fromJSON({endpoint, rpcAddress, error = null, isAvailable = false, isLocal = false}) {
        return new Location(endpoint, rpcAddress, error, isAvailable, isLocal);
    }
}

/**
 * Represents a node with its associated state and metadata.
 */
export class Node {
    /**
     * @param {string} address - The address of the node.
     * @param {string} nodeState - The current state of the node.
     * @param {number} term - The term of the node.
     * @param {string} syncStatus - The synchronization status of the node.
     * @param {number} lastLogTerm - The last log term of the node.
     * @param {number} lastLogIndex - The last log index of the node.
     * @param {string} endpoint - The endpoint associated with the node.
     * @param {string} recoveryStatus - The recovery status of the node.
     */
    constructor(address, nodeState, term, syncStatus, lastLogTerm, lastLogIndex, endpoint, recoveryStatus) {
        this._address = address;
        this._nodeState = nodeState;
        this._term = term;
        this._syncStatus = syncStatus;
        this._lastLogTerm = lastLogTerm;
        this._lastLogIndex = lastLogIndex;
        this._endpoint = endpoint;
        this._recoveryStatus = recoveryStatus;
    }

    /** @return {string} The address of the node. */
    get address() {
        return this._address;
    }

    /** @return {string} The current state of the node. */
    get nodeState() {
        return this._nodeState;
    }

    /** @return {number} The term of the node. */
    get term() {
        return this._term;
    }

    /** @return {string} The synchronization status of the node. */
    get syncStatus() {
        return this._syncStatus;
    }

    /** @return {number} The last log term of the node. */
    get lastLogTerm() {
        return this._lastLogTerm;
    }

    /** @return {number} The last log index of the node. */
    get lastLogIndex() {
        return this._lastLogIndex;
    }

    /** @return {string} The endpoint of the node. */
    get endpoint() {
        return this._endpoint;
    }

    /** @return {string} The recovery status of the node. */
    get recoveryStatus() {
        return this._recoveryStatus;
    }

    set address(value) {
        this._address = value;
    }

    set nodeState(value) {
        this._nodeState = value;
    }

    set term(value) {
        this._term = value;
    }

    set syncStatus(value) {
        this._syncStatus = value;
    }

    set lastLogTerm(value) {
        this._lastLogTerm = value;
    }

    set lastLogIndex(value) {
        this._lastLogIndex = value;
    }

    set endpoint(value) {
        this._endpoint = value;
    }

    set recoveryStatus(value) {
        this._recoveryStatus = value;
    }

    /**
     * Maps JSON data to a Node instance.
     * @param {Object} json - The JSON data.
     * @return {Node} The mapped Node instance.
     */
    static fromJSON({address, nodeState, term, syncStatus, lastLogTerm, lastLogIndex, endpoint, recoveryStatus}) {
        return new Node(address, nodeState, term, syncStatus, lastLogTerm, lastLogIndex, endpoint, recoveryStatus);
    }
}

/**
 * Represents a link between nodes.
 */
export class Link {
    /**
     * @param {string} id - The ID of the link.
     * @param {string} source - The source node of the link.
     * @param {string} target - The target node of the link.
     * @param {string} status - The status of the link.
     */
    constructor(id, source, target, status) {
        this._id = id;
        this._source = source;
        this._target = target;
        this._status = status;
    }

    /**
     * Maps JSON data to a Link instance.
     * @param {Object} json - The JSON data.
     * @return {Link} The mapped Link instance.
     */
    static fromJSON({id, source, target, status}) {
        return new Link(id, source, target, status);
    }
}

/**
 * Represents the cluster model containing locations, nodes, and links.
 */
export class ClusterModel {
    /**
     * @param {Location[]} locations - The list of locations.
     * @param {boolean} hasCluster - Whether the cluster exists.
     * @param {Node[]} nodes - The list of nodes.
     * @param {Link[]} links - The list of links.
     */
    constructor(locations, hasCluster, nodes, links) {
        this._locations = locations;
        this._hasCluster = hasCluster;
        this._nodes = nodes;
        this._links = links;
    }

    /** @return {Location[]} The list of locations. */
    get locations() {
        return this._locations;
    }

    /** @param {Location[]} value The new list of locations. */
    set locations(value) {
        this._locations = value;
    }

    /** @return {boolean} Whether the cluster exists. */
    get hasCluster() {
        return this._hasCluster;
    }

    /** @param {boolean} value Whether the cluster exists. */
    set hasCluster(value) {
        this._hasCluster = value;
    }

    /** @return {Node[]} The list of nodes. */
    get nodes() {
        return this._nodes;
    }

    /** @param {Node[]} value The new list of nodes. */
    set nodes(value) {
        this._nodes = value;
    }

    /** @return {Link[]} The list of links. */
    get links() {
        return this._links;
    }

    /** @param {Link[]} value The new list of links. */
    set links(value) {
        this._links = value;
    }

    /**
     * Maps JSON data to a ClusterModel instance.
     * @param {Object} json - The JSON data.
     * @return {ClusterModel} The mapped ClusterModel instance.
     */
    static fromJSON(json) {
        const locations = json.locations.map(Location.fromJSON);
        const nodes = json.nodes.map(Node.fromJSON);
        const links = json.links.map(Link.fromJSON);

        return new ClusterModel(locations, json.hasCluster, nodes, links);
    }
}

/**
 * ViewModel to manage and present the cluster model data.
 */
export class ClusterViewModel {
    /**
     * @param {Object} clusterModel - The raw cluster model JSON.
     */
    constructor(clusterModel) {
        this._clusterModel = ClusterModel.fromJSON(clusterModel);
        this._addToCluster = new Map();
        this._deleteFromCluster = new Map();
        this._currentNodesCount = 0;
        this._clusterConfiguration = new ClusterConfiguration();
        this.MINIMUM_NODES_REQUIRED = 2;
    }


    /**
     * Gets nodes attached to the cluster.
     * @return {Node[]} The list of attached nodes in view model format.
     */
    getAttached() {
        const nodes = this._clusterModel.nodes;
        const resultNodes = nodes
            .concat(Array.from(this._addToCluster.values()))
            .filter((node) => {
                return !this._deleteFromCluster.has(node.endpoint);
            });

        this._currentNodesCount = resultNodes.length;
        return resultNodes;
    }

    /**
     * Get the view model of the current cluster.
     * @return {ClusterItemViewModel[]} The view model of the cluster.
     */
    getViewModel() {
        return this.getAttached().map((location) => new ClusterItemViewModel(location));
    }

    /**
     * Gets available locations that can be added to the cluster.
     * @param {boolean} includeDeleted include deleted nodes
     * @return {Location[]} The list of available locations in view model format.
     */
    getAvailable(includeDeleted = false) {
        const nodes = this._clusterModel.nodes;
        const locations = this._clusterModel.locations;

        return locations
            .filter((location) => {
                const isNotInNodeList = !this.isPresentInList(nodes, location.endpoint);
                const isAvailable = location.isAvailable;
                const isNotInAddList = !this._addToCluster.has(location.endpoint);

                const isNotDeleted = includeDeleted ? true : !this._deleteFromCluster.has(location.endpoint);

                return isNotInNodeList && isAvailable && isNotDeleted && isNotInAddList;
            });
    }

    /**
     * Gets the endpoints of the available nodes that are not yet part of the cluster.
     *
     * @return {string[]} The list of available node endpoints.
     */
    getAvailableNodeEndpoints() {
        return this.getAvailable().map((node) => node.endpoint);
    }

    /**
     * Retrieves the local node information.
     *
     * @return {Location} The local node location.
     */
    getLocalNode() {
        return this._clusterModel.locations.find((location) => location.isLocal);
    }

    /**
     * Adds a location to the cluster, ensuring uniqueness by endpoint.
     * @param {Location} location - The location in JSON to add.
     */
    addToCluster(location) {
        const endpoint = location.endpoint;

        if (location.endpoint) {
            this.addToLocations(location);
        }

        if (this._deleteFromCluster.has(endpoint)) {
            this._deleteFromCluster.delete(endpoint);
        } else {
            this._addToCluster.set(endpoint, location);
        }
    }

    /**
     * Adds a location to the cluster's location list.
     * If the location is not already present in the list, it will be added.
     * If the location is already present, it will be replaced.
     *
     * @param {Location} location - The location to add to the locations list.
     * @return {void}
     */
    addToLocations(location) {
        const index = ClusterUtil.findIndexByEndpoint(this._clusterModel.locations, location.endpoint);
        if (index === -1) {
            this._clusterModel.locations.push(location);
        } else {
            this._clusterModel.locations.splice(index, 1);
        }
    }

    /**
     * Marks an item for deletion from the cluster, ensuring uniqueness by endpoint.
     * If the item is already marked for addition, it will be removed from the addition map.
     * Otherwise, it will be added to the deletion map.
     *
     * @param {Node|Location} itemToDelete - The item to delete. This can either be a Node or Location object.
     * @return {void}
     */
    deleteFromCluster(itemToDelete) {
        const endpoint = itemToDelete.endpoint;
        if (this._addToCluster.has(endpoint)) {
            this._addToCluster.delete(endpoint);
        } else {
            this._deleteFromCluster.set(endpoint, itemToDelete);
        }
    }

    /**
     * Gets nodes to delete from the cluster.
     * @return {Location|Node[]} The list of nodes to delete from the cluster.
     */
    getDeleteFromCluster() {
        return Array.from(this._deleteFromCluster.values());
    }

    /**
     * Prepares the actions needed to update the cluster, including nodes to be added and removed.
     * Also updates the cluster configuration with the current nodes.
     *
     * @return {Object} An object containing the nodes to be added, the nodes to be removed, and the updated cluster configuration in JSON format.
     * @property {string[]} addNodes - List of node addresses to add to the cluster.
     * @property {string[]} removeNodes - List of node addresses to remove from the cluster.
     * @property {Object} clusterConfiguration - The updated cluster configuration in JSON format.
     */
    getUpdateActions() {
        const addNodes = Array.from(this._addToCluster.values()).map((node) => node.rpcAddress || node.address);
        const removeNodes = Array.from(this._deleteFromCluster.values()).map((node) => node.rpcAddress || node.address);
        const updateActions = {
            addNodes,
            removeNodes
        };

        if (!this.hasCluster()) {
            this._clusterConfiguration.nodes = addNodes;
            updateActions.clusterConfiguration = this._clusterConfiguration.toJSON();
        }
        return updateActions;
    }

    /**
     * Retrieves the current cluster configuration.
     *
     * @return {ClusterConfiguration} The cluster configuration.
     */
    getClusterConfiguration() {
        return this._clusterConfiguration;
    }

    /**
     * Restores a node from the deletion map by removing it from the map of nodes marked for deletion.
     * @param {Node} node - The node to restore from the deletion map.
     * @return {void}
     */
    restoreFromDeletion(node) {
        this._deleteFromCluster.delete(node.endpoint);
    }

    /**
     * Check if an item is present in the list by endpoint.
     * @param {Node[]|Location[]} list - The array of nodes or locations.
     * @param {string} endpoint - The endpoint to check for.
     * @return {boolean} True if the item is found, otherwise false.
     */
    isPresentInList(list, endpoint) {
        return ClusterUtil.isPresentInList(list, endpoint);
    }

    /**
     * Find an item in a list by endpoint.
     * @param {Node[]|Location[]} list - The array of nodes or locations.
     * @param {string} endpoint - The endpoint to search for.
     * @return {Node|Location|undefined} The item if found, otherwise undefined.
     */
    findByEndpoint(list, endpoint) {
        return ClusterUtil.findByEndpoint(list, endpoint);
    }

    /**
     * Find the index of an item by endpoint.
     * @param {Node[]|Location[]} list - The array of nodes or locations.
     * @param {string} endpoint - The endpoint to search for.
     * @return {number} The index of the item if found, otherwise -1.
     */
    findIndexByEndpoint(list, endpoint) {
        return ClusterUtil.findIndexByEndpoint(list, endpoint);
    }

    /**
     * Checks if the current number of nodes meets the minimum required.
     * @return {boolean} True if the current node count is valid, false otherwise.
     */
    hasValidNodesCount() {
        return this._currentNodesCount >= this.MINIMUM_NODES_REQUIRED;
    }

    /**
     * Checks if there are enough nodes to allow a deletion operation.
     * Ensures that after deletion, the number of nodes will still meet the minimum required.
     * @return {boolean} True if it's safe to delete, false otherwise.
     */
    canDeleteNode() {
        return (this._currentNodesCount - 1) >= this.MINIMUM_NODES_REQUIRED;
    }

    /**
     * Checks if the cluster is currently configured.
     *
     * @return {boolean} True if the cluster is configured, false otherwise.
     */
    hasCluster() {
        return this._clusterModel.hasCluster;
    }
}

export class ClusterItemViewModel {
    constructor(item) {
        this._item = item;
        this._endpoint = item.endpoint;
        this._isDeleted = false;
        this._isReplacedBy = undefined;
    }

    getEndPoint() {
        return this._item.endpoint;
    }

    getAddress() {
        if (this._item._address !== undefined) {
            return this._item._address;
        } else if (this._item.rpcAddress !== undefined) {
            return this._item.rpcAddress;
        }
        return null;
    }

    isNode() {
        return this._item._address !== undefined;
    }

    getNodeState() {
        if (this.isNode()) {
            return this._item._nodeState;
        }
        return null;
    }

    getIsAvailable() {
        if (!this.isNode()) {
            return this._item.isAvailable;
        }
        return null;
    }

    getTerm() {
        if (this.isNode()) {
            return this._item._term;
        }
        return null;
    }

    getSyncStatus() {
        if (this.isNode()) {
            return this._item._syncStatus;
        }
        return null;
    }

    getIsLocal() {
        if (!this.isNode()) {
            return this._item.isLocal;
        }
        return null;
    }

    get item() {
        return this._item;
    }

    get endpoint() {
        return this._endpoint;
    }

    set endpoint(value) {
        return this._endpoint = value;
    }

    get isDeleted() {
        return this._isDeleted;
    }

    set isDeleted(value) {
        this._isDeleted = value;
    }


    get isReplacedBy() {
        return this._isReplacedBy;
    }

    set isReplacedBy(value) {
        this._isReplacedBy = value;
    }
}

export class ClusterConfiguration {
    constructor() {
        this._electionMinTimeout = 8000;
        this._electionRangeTimeout = 6000;
        this._heartbeatInterval = 2000;
        this._messageSizeKB = 64;
        this._verificationTimeout = 1500;
        this._transactionLogMaximumSizeGB = 50;
        this._nodes = [];
    }

    get electionMinTimeout() {
        return this._electionMinTimeout;
    }

    set electionMinTimeout(value) {
        this._electionMinTimeout = value;
    }

    get electionRangeTimeout() {
        return this._electionRangeTimeout;
    }

    set electionRangeTimeout(value) {
        this._electionRangeTimeout = value;
    }

    get heartbeatInterval() {
        return this._heartbeatInterval;
    }

    set heartbeatInterval(value) {
        this._heartbeatInterval = value;
    }

    get messageSizeKB() {
        return this._messageSizeKB;
    }

    set messageSizeKB(value) {
        this._messageSizeKB = value;
    }

    get verificationTimeout() {
        return this._verificationTimeout;
    }

    set verificationTimeout(value) {
        this._verificationTimeout = value;
    }

    get transactionLogMaximumSizeGB() {
        return this._transactionLogMaximumSizeGB;
    }

    set transactionLogMaximumSizeGB(value) {
        this._transactionLogMaximumSizeGB = value;
    }

    get nodes() {
        return this._nodes;
    }

    set nodes(value) {
        this._nodes = value;
    }

    toJSON() {
        return {
            electionMinTimeout: this.electionMinTimeout,
            electionRangeTimeout: this.electionRangeTimeout,
            heartbeatInterval: this.heartbeatInterval,
            messageSizeKB: this.messageSizeKB,
            verificationTimeout: this.verificationTimeout,
            transactionLogMaximumSizeGB: this.transactionLogMaximumSizeGB,
            nodes: this.nodes
        };
    }
}

/**
 * Utility class for transforming cluster data to a view model format.
 */
class ClusterUtil {
    /**
     * Checks if an item is present in a list by comparing the endpoint.
     * @param {Node[]|Location[]} list - The array of nodes or locations.
     * @param {string} endpoint - The endpoint to check for.
     * @return {boolean} True if the item is found, otherwise false.
     */
    static isPresentInList(list, endpoint) {
        return list.some((item) => item.endpoint === endpoint);
    }

    /**
     * Finds an item in a list by its endpoint.
     * @param {Node[] | Location[]} list - The array of nodes or locations.
     * @param {string} endpoint - The endpoint to search for.
     * @return {Node|Location|undefined} The item if found, otherwise undefined.
     */
    static findByEndpoint(list, endpoint) {
        return list.find((item) => item.endpoint === endpoint);
    }

    /**
     * Finds the index of an item in a list by its endpoint.
     * @param {Node[]|Location[]} list - The array of nodes or locations.
     * @param {string} endpoint - The endpoint to search for.
     * @return {number} The index of the item if found, otherwise -1.
     */
    static findIndexByEndpoint(list, endpoint) {
        return list.findIndex((item) => item.endpoint === endpoint);
    }
}
