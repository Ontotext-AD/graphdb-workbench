import 'angular/core/services';
import 'angular/core/directives';
import 'angular/security/services';
import 'angular/repositories/services';
import 'angular/rest/sparql.rest.service';
import 'angular/sparql/directives/sparql-tab.directive';
import 'angular/sparql/controllers/query-editor.controller';
import 'angular/sparql/directives/query-editor.directive';
import 'angular-xeditable/dist/js/xeditable.min';
import 'lib/FileSaver-patch';

angular
    .module('graphdb.framework.sparql', [
        'LocalStorageModule',
        'xeditable',
        'ngAnimate',
        'ngRoute',
        'toastr',
        'graphdb.framework.core.directives',
        'graphdb.framework.repositories.services',
        'graphdb.framework.rest.sparql.service',
        'graphdb.framework.sparql.controllers.queryeditor',
        'graphdb.framework.sparql.directives.sparqltab',
        'graphdb.framework.sparql.directives.queryeditor'
    ])
    .run(run);

run.$inject = ['editableOptions'];

function run(editableOptions) {
    editableOptions.theme = 'bs3';
}
