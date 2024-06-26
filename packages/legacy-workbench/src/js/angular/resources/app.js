import 'angular/core/services';
import 'angular/core/directives';
import 'angular/resources/controllers';
import 'angular/core/services/repositories.service';
import 'echarts';
import 'angular/resources/directives';

const modules = [
    'toastr',
    'ui.bootstrap',
    'graphdb.framework.jmx.resources.controllers',
    'graphdb.framework.core.services.repositories',
    'graphdb.framework.core.directives',
    'graphdb.framework.resources.directives'
];

angular.module('graphdb.framework.jmx.resources', modules);

