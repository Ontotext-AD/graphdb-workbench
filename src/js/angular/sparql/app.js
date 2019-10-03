import 'angular/core/services';
import 'angular/core/directives';
import 'angular/repositories/services';
import 'angular/sparql/modules';
import 'angular/sparql/services/sparql.service';
import 'angular/sparql/directives/sparql-tab.directive';
import 'angular/sparql/controllers/query-editor.controller';
import 'angular/security/services';
import 'angular/sparql/directives/query-editor.directive';
import 'angular-xeditable/dist/js/xeditable.min';
import 'lib/FileSaver-patch';

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
