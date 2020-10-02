import 'angular/core/services';
import 'angular/core/directives';
import 'angular/resources/controllers';
import 'angular/core/services/repositories.service';
import 'angular/jdbc/controllers';
import 'angular/rest/jdbc.rest.service';


const modules = [
    'toastr',
    'ui.bootstrap',
    'graphdb.framework.jdbc.controllers',
    'graphdb.framework.core.services.repositories',
    'graphdb.framework.core.directives',
    'graphdb.framework.rest.jdbc.service',

];

angular.module('graphdb.framework.jdbc', modules);

