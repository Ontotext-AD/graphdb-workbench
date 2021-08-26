import 'angular/core/services';
import 'angular/core/directives';
import 'angular/resources/controllers';
import 'angular/core/services/repositories.service';
import 'angular/smart-update/smart-update.controllers';
import 'angular/rest/smart-updates.rest.service';
import 'angular/core/directives/queryeditor/sparql-tab.directive';
import 'angular/core/directives/queryeditor/query-editor.controller';
import 'angular/core/directives/queryeditor/query-editor.directive';

const modules = [
    'toastr',
    'ui.bootstrap',
    'graphdb.framework.smart-update.smart-update.controllers',
    'graphdb.framework.core.services.repositories',
    'graphdb.framework.core.directives',
    'graphdb.framework.rest.smart-updates.service',
    'graphdb.framework.core.directives.queryeditor.controllers',
    'graphdb.framework.core.directives.queryeditor.sparqltab',
    'graphdb.framework.core.directives.queryeditor.queryeditor'
];

angular.module('graphdb.framework.smart-update', modules);

