import 'angular/core/services';
import 'angular/core/directives';
import 'angular/core/services/jwt-auth.service';
import 'angular/core/services/repositories.service';
import 'angular/rest/sparql.rest.service';
import 'angular/core/directives/queryeditor/sparql-tab.directive';
import 'angular/core/directives/queryeditor/query-editor.directive';
import 'angular/core/directives/queryeditor/query-editor.controller';
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
        'graphdb.framework.core.services.repositories',
        'graphdb.framework.rest.sparql.service',
        'graphdb.framework.core.directives.queryeditor.controllers',
        'graphdb.framework.core.directives.queryeditor.sparqltab',
        'graphdb.framework.core.directives.queryeditor.queryeditor'
    ])
    .run(run);

run.$inject = ['editableOptions'];

function run(editableOptions) {
    editableOptions.theme = 'bs3';
}
