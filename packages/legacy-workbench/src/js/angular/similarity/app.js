import 'angular/core/services';
import 'angular/core/directives';
import 'angular/core/controllers';
import 'angular/rest/similarity.rest.service';
import 'angular/similarity/controllers/similarity-list.controller';
import 'angular/similarity/controllers/create-index.controller';
import 'angular/core/directives/yasgui-component/yasgui-component.directive';

angular.module('graphdb.framework.similarity', [
    'graphdb.framework.core.controllers',
    'graphdb.framework.core.directives',
    'graphdb.framework.rest.similarity.service',
    'graphdb.framework.similarity.controllers.create',
    'graphdb.framework.similarity.controllers.list',
    'graphdb.framework.core.directives.yasgui-component'
]);
