const operationsNotification = document.querySelector('onto-operations-notification');
operationsNotification.activeOperations = {
  status: "INFORMATION",
  allRunningOperations: {
    getItems: () =>
      [
        {
          id: "2ce757ff-38ce-4369-a388-c836b9ab6fe4",
          value: "UNAVAILABLE_NODES",
          status: "WARNING",
          type: "clusterHealth",
          count: 0,
          group: "CLUSTER",
          href: "cluster",
          labelKey: "UNAVAILABLE_NODES"
        },
        {
          id: "0cc11f98-137b-4e12-8918-ac53fcfc0f20",
          value: "CREATE_BACKUP_IN_PROGRESS",
          status: "WARNING",
          type: "backupAndRestore",
          count: 0,
          group: "BACKUP",
          href: "monitor/backup-and-restore",
          labelKey: "CREATE_BACKUP_IN_PROGRESS"
        },
        {
          id: "20a1c651-ead6-4ecd-b8db-4eb17c2f5ad7",
          value: "1",
          status: "CRITICAL",
          type: "imports",
          count: 1,
          group: "IMPORT",
          href: "imports",
          labelKey: "imports"
        },
        {
          id: "be9188ce-7f56-4436-b75c-afe35f5dde38",
          value: "25",
          status: "INFORMATION",
          type: "queries",
          count: 25,
          group: "QUERY",
          href: "monitor/queries",
          labelKey: "queries"
        },
        {
          id: "6058203f-0538-4af9-b9fc-a0c92e1de2e2",
          value: "1",
          status: "INFORMATION",
          type: "updates",
          count: 1,
          group: "QUERY",
          href: "monitor/queries",
          labelKey: "updates"
        }
      ]
  }
}
