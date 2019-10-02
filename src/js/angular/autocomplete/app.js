import 'angular/autocomplete/controllers';

const modules = [
    'ngRoute',
    'graphdb.framework.autocomplete.controllers'
];

const autocompleteApp = angular.module('graphdb.framework.autocomplete', modules);

autocompleteApp.config(['$routeProvider', '$menuItemsProvider', function ($routeProvider, $menuItemsProvider) {
    $routeProvider.when('/autocomplete', {
        templateUrl: 'pages/autocomplete.html',
        controller: 'AutocompleteCtrl',
        title: 'Autocomplete index',
        helpInfo: 'The Autocomplete index is used for automatic completion of URIs in the SPARQL editor and the View resource page. Use this view to enable or disable the index and check its status.'
    });

    $menuItemsProvider.addItem({label: 'Setup', href: '#', order: 5, role: 'IS_AUTHENTICATED_FULLY', icon: "icon-settings"});
    $menuItemsProvider.addItem({label: 'Autocomplete', href: 'autocomplete', order: 40, parent: 'Setup', role: "IS_AUTHENTICATED_FULLY"});
}]);
