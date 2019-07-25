define([
        'angular/core/services',
        'angular/core/directives',
        'angular/repositories/services',
        'angular/sparql/modules',
        'angular/sparql/services/sparql.service',
        'angular/sparql/directives/sparql-tab.directive',
        'angular/sparql/controllers/query-editor.controller',
        'angular/security/services',
        // 'angular/sparql/controllers',
        'angular/sparql/directives/query-editor.directive',
        // 'angular/sparql/directives',
        'lib/angular-xeditable/0.1.8/js/xeditable.min',
        'lib/FileSaver-patch'],

    function () {

        angular
            .module('graphdb.framework.sparql')
            .config(config)
            .run(run);

        config.$inject = ['$routeProvider', '$menuItemsProvider'];
        function config($routeProvider, $menuItemsProvider) {

            $menuItemsProvider.addItem({
                label: 'SPARQL',
                href: 'sparql',
                order: 2,
                role: 'IS_AUTHENTICATED_FULLY',
                icon: "icon-sparql"
            });

            $routeProvider.when('/sparql', {
                templateUrl: 'pages/sparql.html',
                controller: 'QueryEditorCtrl',
                title: 'SPARQL Query & Update',
                helpInfo: 'The SPARQL Query & Update view is a unified editor for queries and updates. '
                + 'Use any type of SPARQL query and click Run to execute it.'
            });
        }

        run.$inject = ['editableOptions'];
        function run(editableOptions) {
            editableOptions.theme = 'bs3';
        }
    });
