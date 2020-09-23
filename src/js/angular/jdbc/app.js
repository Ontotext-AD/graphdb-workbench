import 'angular/core/services';
import 'angular/core/directives';
import 'angular/resources/controllers';
import 'angular/core/services/repositories.service';
import 'angular/jdbc/controllers'

const modules = [
    'toastr',
    'ui.bootstrap',
    'graphdb.framework.jdbc.controllers',
    'graphdb.framework.core.services.repositories',
    'graphdb.framework.core.directives'
];

angular.module('graphdb.framework.jdbc', modules);

