import 'angular/sparql-editor/controllers';
import 'angular/sparql-editor/share-query-link.service';

const modules = [
    'ui.bootstrap',
    'graphdb.framework.sparql-editor.share-query.service',
    'graphdb.framework.sparql-editor.controllers'
];

angular.module('graphdb.framework.sparql-editor', modules);
