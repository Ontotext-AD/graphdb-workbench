PluginRegistry.add('route', [
    {
        'url': '/ontorefine',
        'module': 'graphdb.framework.ontorefine',
        'path': 'ontorefine/app',
        'chunk': 'ontorefine',
        'controller': 'OntoRefineCtrl',
        'templateUrl': 'pages/ontorefine.html',
        'title': 'OntoRefine',
        'helpInfo': 'GraphDB OntoRefine is a data transformation tool, based on OpenRefine and integrated in GraphDB Workbench, for ' +
        'converting tabular data into RDF and importing it into a GraphDB repository, using simple SPARQL queries and a virtual endpoint.  ' +
        'The supported formats are TSV, CSV, *SV, Excel (.xls and. xlsx), JSON, XML, RDF as XML, and Google sheet. ' +
        'Using OntoRefine you can easily filter your data, edit the inconsistencies, convert it into RDF, and import it into your repository.'
    }, {
        'url': '/ontorefine/:page',
        'module': 'graphdb.framework.ontorefine',
        'path': 'ontorefine/app',
        'chunk': 'ontorefine',
        'controller': 'OntoRefineCtrl',
        'templateUrl': 'pages/ontorefine.html',
        'title': 'OntoRefine',
        'helpInfo': 'GraphDB OntoRefine is a data transformation tool, based on OpenRefine and integrated in GraphDB Workbench, for ' +
        'converting tabular data into RDF and importing it into a GraphDB repository, using simple SPARQL queries and a virtual endpoint.  ' +
        'The supported formats are TSV, CSV, *SV, Excel (.xls and. xlsx), JSON, XML, RDF as XML, and Google sheet. ' +
        'Using OntoRefine you can easily filter your data, edit the inconsistencies, convert it into RDF, and import it into your repository.'
    }, {
        'url': '/ontorefine/project?project=:project',
        'module': 'graphdb.framework.ontorefine',
        'path': 'ontorefine/app',
        'chunk': 'ontorefine',
        'controller': 'OntoRefineCtrl',
        'templateUrl': 'pages/ontorefine.html',
        'title': 'view.ontoRefine.title',
        'helpInfo': 'view.ontoRefine.helpInfo'
    }
]);

PluginRegistry.add('main.menu', {
    'items': [
        {
            label: 'Import',
            labelKey: 'common.import',
            href: '#',
            order: 0,
            role: 'IS_AUTHENTICATED_FULLY',
            icon: 'icon-import'
        },
        {
            label: 'Tabular (OntoRefine)',
            labelKey: 'menu.ontoRefine.label',
            href: 'ontorefine',
            order: 2,
            parent: 'Import',
            role: 'ROLE_USER'
        }
    ]
});
