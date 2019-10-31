import 'angular/core/services';
import 'angular/core/directives';
import 'angular/resources/controllers';
import 'angular/repositories/services';
import 'd3/build/d3';
import 'lib/nvd3/angular-nvd3';

const modules = [
    'toastr',
    'ui.bootstrap',
    'nvd3',
    'graphdb.framework.jmx.resources.controllers',
    'graphdb.framework.repositories.services',
    'graphdb.framework.core.directives'
];

angular.module('graphdb.framework.jmx.resources', modules);

