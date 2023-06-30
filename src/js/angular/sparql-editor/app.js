import 'angular/sparql-editor/controllers';
import 'angular/sparql-editor/share-query-link.service';
import 'angular/core/directives/yasgui-component/yasgui-component.directive';

const modules = [
    'ui.bootstrap',
    'graphdb.framework.sparql-editor.share-query.service',
    'graphdb.framework.sparql-editor.controllers',
    'graphdb.framework.core.directives.yasgui-component'
];

angular.module('graphdb.framework.sparql-editor', modules);
