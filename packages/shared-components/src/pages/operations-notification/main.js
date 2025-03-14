const operationsNotification = document.querySelector('onto-operations-notification');
operationsNotification.activeOperations = {
  toOperationsGroupSummary: () => {
    return {
      getItems: () => [],
    }
  }
}

const activeOperationsMock = {
  status: 'INFORMATION',
  allRunningOperations: [
    {
      value: '25',
      status: 'INFORMATION',
      type: 'queries'
    },
    {
      value: '1',
      status: 'INFORMATION',
      type: 'updates'
    },
    {
      value: '1',
      status: 'CRITICAL',
      type: 'imports'
    },
    {
      value: 'CREATE_BACKUP_IN_PROGRESS',
      status: 'WARNING',
      type: 'backupAndRestore'
    },
    {
      value: 'UNAVAILABLE_NODES',
      status: 'WARNING',
      type: 'clusterHealth'
    }
  ]
}

toOperationsStatusSummary(activeOperationsMock)
  .then((summary) => operationsNotification.activeOperations = summary);
