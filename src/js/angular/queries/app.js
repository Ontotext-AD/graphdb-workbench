import 'angular/core/services';
import 'angular/core/directives';
import 'angular/queries/controllers';
import 'angular/queries/directives';

const modules = [
    'toastr',
    'ui.bootstrap',
    'graphdb.framework.jmx.queries.controllers',
    'graphdb.framework.jmx.queries.directives',
    'graphdb.framework.core.directives'
];

angular.module('graphdb.framework.jmx.queries', modules);
