import 'angular/core/services';
import 'angular/core/directives';
import 'angular/core/controllers';
import 'angular/rest/similarity.rest.service';
import 'angular/similarity/controllers/similarity-list.controller';
import 'angular/similarity/controllers/create-index.controller';
import 'angular/directives/queryeditor/sparql-tab.directive';
import 'angular/directives/queryeditor/query-editor.controller';
import 'angular/directives/queryeditor/query-editor.directive';

angular.module('graphdb.framework.similarity', [
    'graphdb.framework.core.controllers',
    'graphdb.framework.core.directives',
    'graphdb.framework.rest.similarity.service',
    'graphdb.framework.similarity.controllers.create',
    'graphdb.framework.similarity.controllers.list',
    'graphdb.framework.directives.queryeditor.controllers',
    'graphdb.framework.directives.queryeditor.sparqltab',
    'graphdb.framework.directives.queryeditor.queryeditor'
]);
