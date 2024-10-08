export class RemoteLocationModel {
    constructor(data = {}) {
        this.uri = data.uri;
        this.label = data.label || '';
        this.username = data.username;
        this.password = data.password;
        this.authType = data.authType || 'none';
        this.active = data.active;
        this.local = data.local;
        this.system = data.system;
        this.errorMsg = data.errorMsg;
        this.defaultRepository = data.defaultRepository;
        this.isInCluster = data.isInCluster;
        this.locationType = data.locationType || RemoteLocationType.GRAPH_DB;
    }

    isGraphDBLocation() {
        return RemoteLocationType.GRAPH_DB === this.locationType;
    }

    isOntopicLocation() {
        return RemoteLocationType.ONTOPIC === this.locationType;
    }

    isSparqlLocation() {
        return RemoteLocationType.SPARQL === this.locationType;
    }

    isBasicAuthType() {
        return RemoteLocationAuthType.BASIC === this.authType;
    }

    isSignatureAuthType() {
        return RemoteLocationAuthType.SIGNATURE === this.authType;
    }

    isNoneAuthType() {
        return RemoteLocationAuthType.NONE === this.authType;
    }
}

/**
 * Enumeration for different remote location types.
 */
export const RemoteLocationType = {
    'GRAPH_DB': 'GDB',
    'ONTOPIC': 'ONTOPIC',
    'SPARQL': 'SPARQL'
};

/**
 * Enumeration for different remote location authentication types.
 */
export const RemoteLocationAuthType = {
    NONE: 'none',
    BASIC: 'basic',
    SIGNATURE: 'signature'
};
