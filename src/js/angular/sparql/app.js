import 'angular/core/services';
import 'angular/core/directives';
import 'angular/repositories/services';
import 'angular/sparql/modules';
import 'angular/rest/sparql.rest.service';
import 'angular/sparql/directives/sparql-tab.directive';
import 'angular/sparql/controllers/query-editor.controller';
import 'angular/security/services';
import 'angular/sparql/directives/query-editor.directive';
import 'angular-xeditable/dist/js/xeditable.min';
import 'lib/FileSaver-patch';

angular
    .module('graphdb.framework.sparql')
    .run(run);

run.$inject = ['editableOptions'];

function run(editableOptions) {
    editableOptions.theme = 'bs3';
}
