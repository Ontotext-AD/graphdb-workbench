import 'angular/core/services';
import 'angular/core/directives';
import 'angular/resources/controllers';
import 'angular/core/services/repositories.service';
import 'angular/jdbc/controllers';
import 'angular/rest/jdbc.rest.service';
import 'angular/core/directives/queryeditor/sparql-tab.directive';
import 'angular/core/directives/queryeditor/query-editor.controller';
import 'angular/core/directives/queryeditor/query-editor.directive';

const modules = [
    'toastr',
    'ui.bootstrap',
    'graphdb.framework.jdbc.controllers',
    'graphdb.framework.core.services.repositories',
    'graphdb.framework.core.directives',
    'graphdb.framework.rest.jdbc.service',
    'graphdb.framework.core.directives.queryeditor.controllers',
    'graphdb.framework.core.directives.queryeditor.sparqltab',
    'graphdb.framework.core.directives.queryeditor.queryeditor'

];

angular.module('graphdb.framework.jdbc', modules);

