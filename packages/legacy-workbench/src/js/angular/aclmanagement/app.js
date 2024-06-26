import 'angular/core/services';
import 'angular/core/directives';
import 'angular/core/controllers';
import 'angular/repositories/controllers';
import 'angular/aclmanagement/controllers';
import 'angular/core/services/repositories.service';
import 'angular/aclmanagement/directives/custom-role-handler.directive';

const modules = [
    'ui.bootstrap',
    'toastr',
    'ngCookies',
    'ngRoute',
    'graphdb.framework.aclmanagement.directives',
    'graphdb.framework.aclmanagement.controllers',
    'graphdb.framework.core.services.repositories',
    'graphdb.framework.core.directives',
    'graphdb.framework.core.controllers'
];

angular.module('graphdb.framework.aclmanagement', modules);
