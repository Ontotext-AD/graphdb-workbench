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
     * @param {Object} topologyStatus - The topology status of the node.
     */
    constructor(address, nodeState, term, syncStatus, lastLogTerm, lastLogIndex, endpoint, recoveryStatus, topologyStatus) {
        this._address = address;
        this._nodeState = nodeState;
        this._term = term;
        this._syncStatus = syncStatus;
        this._lastLogTerm = lastLogTerm;
        this._lastLogIndex = lastLogIndex;
        this._endpoint = endpoint;
        this._recoveryStatus = recoveryStatus;
        this._topologyStatus = TopologyStatus.fromJSON(topologyStatus);
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

    get topologyStatus() {
        return this._topologyStatus;
    }

    set topologyStatus(value) {
        return this._topologyStatus = value;
    }

    /**
     * Maps JSON data to a Node instance.
     * @param {Object} json - The JSON data.
     * @return {Node} The mapped Node instance.
     */
    static fromJSON({address, nodeState, term, syncStatus, lastLogTerm, lastLogIndex, endpoint, recoveryStatus, topologyStatus}) {
        return new Node(address, nodeState, term, syncStatus, lastLogTerm, lastLogIndex, endpoint, recoveryStatus, topologyStatus);
    }
}

/**
 * Represents the status of a topology.
 */
export class TopologyStatus {
    /**
     * @param {string} state - The current state of the topology.
     * @param {{string, number}[]} [primaryTags=[]] - A map of primary tags and their associated values (optional).
     * @param {number} [primaryIndex] - The index of the primary cluster.
     * @param {string} [primaryLeader] - The leader's rpc address of the primary cluster.
     */
    constructor(state, primaryTags = new Map(), primaryIndex, primaryLeader) {
        this._state = state;
        this._primaryTags = primaryTags;
        this._primaryIndex = primaryIndex;
        this._primaryLeader = primaryLeader;
    }

    get state() {
        return this._state;
    }

    get primaryTags() {
        return this._primaryTags;
    }

    get primaryIndex() {
        return this._primaryIndex;
    }

    get primaryLeader() {
        return this._primaryLeader;
    }

    /**
     * Maps JSON data to a TopologyStatus instance.
     * Converts primaryTags from an object to a Map if provided, otherwise defaults to an empty Map.
     * @param {Object} json - The JSON data.
     * @return {TopologyStatus} The mapped TopologyStatus instance.
     */
    static fromJSON({state, primaryTags = {}, primaryIndex, primaryLeader}) {
        const primaryTagsMap = Object.entries(primaryTags);
        return new TopologyStatus(state, primaryTagsMap, primaryIndex, primaryLeader);
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
        this._localNodeEndpoint = clusterModel.locations.find((location) => location.isLocal).endpoint;
        this.MINIMUM_NODES_REQUIRED = 2;
    }


    /**
     * Gets nodes attached to the cluster.
     * @return {Node[]} The list of attached nodes in view model format.
     */
    getAttached() {
        const nodes = this._clusterModel.nodes;
        const resultNodes = nodes
            .concat(Array.from(this._addToCluster.values()));

        this._currentNodesCount = resultNodes.filter((node) => !this._deleteFromCluster.has(node.endpoint)).length;
        return resultNodes;
    }

    /**
     * Get the view model of the current cluster.
     * @return {ClusterItemViewModel[]} The view model of the cluster.
     */
    getViewModel() {
        let index = 0;
        return this.getAttached().map((item) => {
            const location = new ClusterItemViewModel(item);
            if (this._deleteFromCluster.has(item.endpoint)) {
                location.isDeleted = true;
            } else {
                location.index = index++;
            }
            if (this._localNodeEndpoint === item.endpoint) {
                location.isLocal = true;
            }
            return location;
        });
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
     * Also updates the cluster configuration with the current nodes if necessary.
     *
     * @return {Object} An object containing the nodes to be added, the nodes to be removed, and the updated cluster configuration in JSON format.
     * @property {string[]} addNodes - List of node addresses to add to the cluster.
     * @property {string[]} removeNodes - List of node addresses to remove from the cluster.
     * @property {Object} [clusterConfiguration] - The updated cluster configuration in JSON format, if applicable.
     */
    getUpdateActions() {
        const addNodes = Array.from(this._addToCluster.values()).map((node) => node.endpoint);
        const removeNodes = Array.from(this._deleteFromCluster.values()).map((node) => node.endpoint);
        const updateActions = {
            addNodes,
            removeNodes
        };

        const updatedClusterConfig = this.updateClusterConfiguration(addNodes);
        if (updatedClusterConfig) {
            updateActions.clusterConfiguration = updatedClusterConfig;
        }

        return updateActions;
    }

    /**
     * Updates the cluster configuration with the current nodes if the cluster does not exist.
     *
     * @param {string[]} addNodes - List of node addresses to add to the cluster.
     * @return {Object|null} The updated cluster configuration in JSON format, or null if no update is made.
     */
    updateClusterConfiguration(addNodes) {
        if (!this.hasCluster()) {
            this._clusterConfiguration.nodes = addNodes;
            return this._clusterConfiguration.toJSON();
        }
        return null;
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

    isChanged() {
        return this._addToCluster.size > 0 || this._deleteFromCluster.size > 0;
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
     * Determines if a node can be deleted from the cluster based on the current
     * number of nodes marked for deletion and the total number of nodes in the cluster.
     *
     * This function ensures that less than half of the healthy nodes are marked for deletion.
     * Deleting 50% or more of the nodes can severely affect quorum-based replication and
     * increase the likelihood of issues such as split-brain scenarios, where the cluster
     * is divided into disjointed sub-clusters, leading to data inconsistency or system failure.
     *
     * The condition is based on the fact that quorum-based systems require more than
     * half of the nodes to be healthy for consistent decision-making.
     *
     * @return {boolean} True if a node can be deleted (less than half the nodes are marked for deletion), otherwise false.
     */
    canDeleteNode() {
        const quorumThreshold = Math.floor(this._clusterModel.nodes.length / 2);
        return this._deleteFromCluster.size < quorumThreshold;
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
        this._index = undefined;
        this._isLocal = false;
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

    isLocation() {
        return this._item._address === undefined;
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
            return this._item.term;
        }
        return null;
    }

    getSyncStatus() {
        if (this.isNode()) {
            return this._item.syncStatus;
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

    get index() {
        return this._index;
    }

    set index(value) {
        this._index = value;
    }

    get isLocal() {
        return this._isLocal;
    }

    set isLocal(value) {
        this._isLocal = value;
    }
}

export class ClusterConfiguration {
    constructor({
                    electionMinTimeout = 8000,
                    electionRangeTimeout = 6000,
                    heartbeatInterval = 2000,
                    messageSizeKB = 64,
                    verificationTimeout = 1500,
                    transactionLogMaximumSizeGB = 50,
                    batchUpdateInterval = 5000,
                    nodes = [],
                    secondaryTag,
                    primaryNodes
                } = {}) {
        this._electionMinTimeout = electionMinTimeout;
        this._electionRangeTimeout = electionRangeTimeout;
        this._heartbeatInterval = heartbeatInterval;
        this._messageSizeKB = messageSizeKB;
        this._verificationTimeout = verificationTimeout;
        this._transactionLogMaximumSizeGB = transactionLogMaximumSizeGB;
        this._batchUpdateInterval = batchUpdateInterval;
        this._nodes = nodes;
        this._secondaryTag = secondaryTag;
        this._primaryNodes = primaryNodes;
    }

    static fromJSON(json) {
        return new ClusterConfiguration(json);
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

    get batchUpdateInterval() {
        return this._batchUpdateInterval;
    }

    set batchUpdateInterval(value) {
        this._batchUpdateInterval = value;
    }

    get secondaryTag() {
        return this._secondaryTag;
    }

    set secondaryTag(value) {
        this._secondaryTag = value;
    }

    get primaryNodes() {
        return this._primaryNodes;
    }

    set primaryNodes(value) {
        this._primaryNodes = value;
    }

    toJSON() {
        const json = {
            electionMinTimeout: this._electionMinTimeout,
            electionRangeTimeout: this._electionRangeTimeout,
            heartbeatInterval: this._heartbeatInterval,
            messageSizeKB: this._messageSizeKB,
            verificationTimeout: this._verificationTimeout,
            transactionLogMaximumSizeGB: this._transactionLogMaximumSizeGB,
            batchUpdateInterval: this._batchUpdateInterval,
            nodes: this._nodes
        };
        if (this._secondaryTag !== undefined) json.secondaryTag = this._secondaryTag;
        if (this._primaryNodes !== undefined) json.primaryNodes = this._primaryNodes;
        return json;
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
