import 'angular/core/services';
import 'angular/core/directives';
import 'angular/queries/controllers';

const modules = [
    'toastr',
    'ui.bootstrap',
    'graphdb.framework.jmx.queries.controllers',
    'graphdb.framework.core.directives'
];

angular.module('graphdb.framework.jmx.queries', modules);
