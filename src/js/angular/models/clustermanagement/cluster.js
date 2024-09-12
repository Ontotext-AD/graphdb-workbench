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
        this._addToCluster = [];
        this._deleteFromCluster = [];
        this.MINIMUM_NODES_REQUIRED_FOR_DELETION = 2;
    }

    /**
     * Gets nodes attached to the cluster.
     * @return {ClusterNodeViewModel[]} The list of attached nodes in view model format.
     */
    getAttached() {
        const nodes = this._clusterModel.nodes;
        const locations = this._clusterModel.locations;

        const locationMap = new Map();
        locations.forEach((location) => {
            locationMap.set(location.endpoint, location);
        });


        return nodes.map((node) => {
            const location = locationMap.get(node.endpoint);
            return ClusterUtil.toNodeLocationViewModel(location, node);
        })
            .concat(this._addToCluster)
            .filter((node) => !this.isPresentInList(this._deleteFromCluster, node.endpoint));
    }

    /**
     * Gets available locations that can be added to the cluster.
     * @return {ClusterNodeViewModel[]} The list of available locations in view model format.
     */
    getAvailable() {
        const nodes = this._clusterModel.nodes;
        const locations = this._clusterModel.locations;
        return locations.filter(
            (location) =>
                !this.isPresentInList(nodes, location.endpoint) &&
                location.isAvailable &&
                !this.isPresentInList(this._deleteFromCluster, location.endpoint)
        ).map((location) => ClusterUtil.toNodeLocationViewModel(location));
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
     * Adds a location to the cluster.
     * @param {Location} location - The location to add.
     */
    addToCluster(location) {
        this._addToCluster.push(Location.fromJSON(location));
    }

    /**
     * Marks an item for deletion from the cluster.
     * If the item is already marked for addition, it will be removed from the addition list.
     * Otherwise, it will be added to the deletion list.
     *
     * @param {Node|Location} itemToDelete - The item to delete. This can either be a Node or Location object.
     * @return {void}
     */
    deleteFromCluster(itemToDelete) {
        const locationIndex = this.findIndexByEndpoint(this._addToCluster, itemToDelete.endpoint);
        if (locationIndex === -1) {
            this._deleteFromCluster.push(itemToDelete);
        } else {
            this._addToCluster.splice(locationIndex, 1);
        }
    }

    /**
     * Gets the view model of the current cluster.
     * @return {Node[]} The list of nodes in the current view model.
     */
    getViewModel() {
        const nodes = [...this._clusterModel.nodes, ...this._addToCluster];
        return nodes.filter((node) => !this.isPresentInList(this._deleteFromCluster, node.endpoint));
    }

    /**
     * Gets nodes added to the cluster.
     * @return {Location[]} The list of nodes added to the cluster.
     */
    getAddToCluster() {
        return this._addToCluster;
    }

    /**
     * Gets nodes to delete from the cluster.
     * @return {Location|Node[]} The list of nodes added to the cluster.
     */
    getDeleteFromCluster() {
        return this._deleteFromCluster;
    }

    /**
     * Restores a node from the deletion list by removing it from the list of nodes marked for deletion.
     * @param {Node} node - The node to restore from the deletion list.
     * @return {void}
     */
    restoreFromDeletion(node) {
        const deleteList = this.getDeleteFromCluster();
        const index = this.findIndexByEndpoint(deleteList, node.endpoint);

        if (index !== -1) {
            deleteList.splice(index, 1);
        } else {
            throw new Error('Node not found in the deletion list');
        }
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
     * Checks if there are enough nodes to allow a deletion operation.
     * @return {boolean} True if it's safe to delete, false otherwise.
     */
    canDeleteNode() {
        return this.getAttached().length > this.MINIMUM_NODES_REQUIRED_FOR_DELETION;
    }
}

/**
 * Represents the view model for a cluster node.
 */
export class ClusterNodeViewModel {
    /**
     * @param {string} address - The node's address.
     * @param {string} nodeState - The state of the node.
     * @param {number} term - The term of the node.
     * @param {string} syncStatus - The synchronization status of the node.
     * @param {number} lastLogTerm - The last log term.
     * @param {number} lastLogIndex - The last log index.
     * @param {string} recoveryStatus - The recovery status.
     * @param {string} endpoint - The endpoint for the node or location.
     * @param {string} rpcAddress - The RPC address for the node or location.
     * @param {boolean} isLocal - Whether the node or location is local.
     * @param {string} error - Error state, if any.
     * @param {boolean} isAvailable - Whether the node or location is available.
     */
    constructor({
                    address = null,
                    nodeState = null,
                    term = null,
                    syncStatus = null,
                    lastLogTerm = null,
                    lastLogIndex = null,
                    recoveryStatus = null,
                    endpoint = null,
                    rpcAddress = null,
                    isLocal = null,
                    error = null,
                    isAvailable = null
                } = {}) {
        this.address = address;
        this.nodeState = nodeState;
        this.term = term;
        this.syncStatus = syncStatus;
        this.lastLogTerm = lastLogTerm;
        this.lastLogIndex = lastLogIndex;
        this.recoveryStatus = recoveryStatus;
        this.endpoint = endpoint;
        this.rpcAddress = rpcAddress;
        this.isLocal = isLocal;
        this.error = error;
        this.isAvailable = isAvailable;
    }
}

/**
 * Utility class for transforming cluster data to a view model format.
 */
class ClusterUtil {
    /**
     * Converts location and node data into a ClusterNodeViewModel instance.
     * @param {Location} location - The location data.
     * @param {Node} [node] - The node data (optional).
     * @return {ClusterNodeViewModel} The view model instance.
     */
    static toNodeLocationViewModel(location, node) {
        return new ClusterNodeViewModel({
            address: node ? node.address : null,
            nodeState: node ? node.nodeState : null,
            term: node ? node.term : null,
            syncStatus: node ? node.syncStatus : null,
            lastLogTerm: node ? node.lastLogTerm : null,
            lastLogIndex: node ? node.lastLogIndex : null,
            recoveryStatus: node ? node.recoveryStatus : null,
            endpoint: node ? node.endpoint : location ? location.endpoint : null,
            rpcAddress: node ? node.endpoint : location ? location.rpcAddress : null,
            isLocal: location ? location.isLocal : null,
            error: location ? location.error : null,
            isAvailable: location ? location.isAvailable : null
        });
    }

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
     * @param {Node[]|Location[]} list - The array of nodes or locations.
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
