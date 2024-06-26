export const OPERATION_TYPE = {
    'CLUSTER_STATUS': 'clusterHealth',
    'BACKUP_RESTORE': 'backupAndRestore',
    'QUERIES': 'queries',
    'UPDATES': 'updates',
    'IMPORTS': 'imports'
};

export const OPERATION_TYPE_SORT_ORDER = {
    'clusterHealth': 0,
    'backupAndRestore': 1,
    'queries': 3,
    'updates': 4,
    'imports': 2
};
