export const SimilarityIndexStatus = {
    'CREATING': 'CREATING',
    'BUILDING': 'BUILDING',
    'BUILT': 'BUILT',
    'REBUILDING': 'REBUILDING',
    'OUTDATED': 'OUTDATED',
    'INTERRUPTED': 'INTERRUPTED',
    'OBSOLETE': 'OBSOLETE',
    'FAILED': 'FAILED',

    'isCreatingStatus': (status) => {
        return SimilarityIndexStatus.CREATING === status;
    },

    'isBuildingStatus': (status) => {
        return SimilarityIndexStatus.BUILDING === status;
    },

    'isBuiltStatus': (status) => {
        return SimilarityIndexStatus.BUILT === status;
    },

    'isRebuildingStatus': (status) => {
        return SimilarityIndexStatus.REBUILDING === status;
    },

    'isOutdatedStatus': (status) => {
        return SimilarityIndexStatus.OUTDATED === status;
    },

    'isInterruptedStatus': (status) => {
        return SimilarityIndexStatus.INTERRUPTED === status;
    },

    'isObsoleteStatus': (status) => {
        return SimilarityIndexStatus.OBSOLETE === status;
    },

    'isFailedStatus': (status) => {
        return SimilarityIndexStatus.FAILED === status;
    }
};
