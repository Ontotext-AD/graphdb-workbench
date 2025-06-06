export const NodeState = {
    LEADER: 'LEADER',
    FOLLOWER: 'FOLLOWER',
    CANDIDATE: 'CANDIDATE',
    OUT_OF_SYNC: 'OUT_OF_SYNC',
    NO_CONNECTION: 'NO_CONNECTION',
    READ_ONLY: 'READ_ONLY',
    RESTRICTED: 'RESTRICTED',
    NO_CLUSTER: 'NO_CLUSTER'
};

export const RecoveryState = {
    SEARCHING_FOR_NODE: 'SEARCHING_FOR_NODE',
    WAITING_FOR_SNAPSHOT: 'WAITING_FOR_SNAPSHOT',
    RECEIVING_SNAPSHOT: 'RECEIVING_SNAPSHOT',
    APPLYING_SNAPSHOT: 'APPLYING_SNAPSHOT',
    BUILDING_SNAPSHOT: 'BUILDING_SNAPSHOT',
    SENDING_SNAPSHOT: 'SENDING_SNAPSHOT',
    RECOVERY_OPERATION_FAILURE_WARNING: 'RECOVERY_OPERATION_FAILURE_WARNING'
};

export const LinkState = {
    IN_SYNC: 'IN_SYNC',
    OUT_OF_SYNC: 'OUT_OF_SYNC',
    SYNCING: 'SYNCING',
    NO_CONNECTION: 'NO_CONNECTION',
    // complimentary state, built based on the recovery state of two nodes when one is receiving snapshot to the other
    RECEIVING_SNAPSHOT: 'RECEIVING_SNAPSHOT'
};

export const TopologyState = {
    PRIMARY_NODE: 'PRIMARY_NODE',
    SECONDARY_NODE: 'SECONDARY_NODE'
};
