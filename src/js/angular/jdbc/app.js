import 'angular/core/services';
import 'angular/core/directives';
import 'angular/resources/controllers';
import 'angular/core/services/repositories.service';
import 'angular/jdbc/controllers';
import 'angular/rest/jdbc.rest.service';
import 'angular/core/directives/yasgui-component/yasgui-component.directive';

const modules = [
    'toastr',
    'ui.bootstrap',
    'graphdb.framework.jdbc.controllers',
    'graphdb.framework.core.services.repositories',
    'graphdb.framework.core.directives',
    'graphdb.framework.rest.jdbc.service',
    'graphdb.framework.core.directives.yasgui-component'
];

angular.module('graphdb.framework.jdbc', modules);

