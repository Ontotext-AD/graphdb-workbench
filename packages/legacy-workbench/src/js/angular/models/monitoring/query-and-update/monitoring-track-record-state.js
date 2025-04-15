export const MonitoringTrackRecordState = {
    /**
     * Initial state before a permit has been acquired.
     */
    'PENDING': 'PENDING',

    /**
     * state between IN_NEXT and IN_HAS_NEXT
     */
    'ACTIVE': 'ACTIVE',

    // =====================
    // = Iterators' states =
    // =====================
    'IN_NEXT': 'IN_NEXT',
    'IN_HAS_NEXT': 'IN_HAS_NEXT',

    // ======================================
    // = SE/Free/Worker transaction states =
    // ======================================
    'COMMIT_PENDING': 'COMMIT_PENDING',
    'IN_COMMIT': 'IN_COMMIT',
    'IN_COMMIT_PLUGIN': 'IN_COMMIT_PLUGIN',
    'PARALLEL_BEGIN': 'PARALLEL_BEGIN',
    'IN_PARALLEL_IMPORT': 'IN_PARALLEL_IMPORT',
    'IN_PARALLEL_COMMIT': 'IN_PARALLEL_COMMIT',

    // =================
    // = Master states =
    // =================
    'ENQUEUED': 'ENQUEUED',
    'IN_TESTING': 'IN_TESTING',

    /**
     * final state
     */
    'CLOSED': 'CLOSED'
}
