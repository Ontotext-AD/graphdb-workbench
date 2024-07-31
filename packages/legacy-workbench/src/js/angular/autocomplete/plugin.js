PluginRegistry.add('route', {
    'url': '/autocomplete',
    'module': 'graphdb.framework.autocomplete',
    'path': 'autocomplete/app',
    'chunk': 'autocomplete',
    'controller': 'AutocompleteCtrl',
    'templateUrl': 'pages/autocomplete.html',
    'title': 'view.autocomplete.title',
    'helpInfo': 'view.autocomplete.helpInfo',
    'documentationUrl': 'autocomplete-index.html'
});

PluginRegistry.add('main.menu', {
    'items': [
        {label: 'Autocomplete', labelKey: 'menu.autocomplete.label', href: 'autocomplete', order: 40, parent: 'Setup', role: "IS_AUTHENTICATED_FULLY", guideSelector: 'sub-menu-autocomplete'}
    ]
});
