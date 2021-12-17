PluginRegistry.add('route', [
    {
        'url': '/cluster',
        'module': 'graphdb.framework.clustermanagement',
        'chunk': 'clustermanagement',
        'path': 'clustermanagement/app',
        'controller': 'ClusterManagementCtrl',
        'templateUrl': 'pages/clusterInfo.html',
        'helpInfo': 'The Cluster management view is a visual administration tool '
            + 'for the GraphDB cluster. Here you can create or modify a cluster '
            + 'by dragging and dropping the nodes or you can use it to monitor '
            + ' the state of a running cluster in near real time. '
            + 'The view shows repositories from the active location and all remote locations.',
        'title': 'Cluster management'
    }
]);

PluginRegistry.add('main.menu', {
    'items': [{
        label: 'Cluster',
        href: 'cluster',
        order: 20,
        role: 'ROLE_ADMIN',
        parent: 'Setup'
    }]
});

