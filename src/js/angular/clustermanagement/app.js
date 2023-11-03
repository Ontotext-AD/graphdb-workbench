import 'angular/core/services';
import 'angular/core/directives';
import 'angular/clustermanagement/controllers';
import 'angular/clustermanagement/directives';
import 'angular/core/services/repositories.service';
import 'lib/d3.patch.js';
import 'angular-pageslide-directive/dist/angular-pageslide-directive';

const modules = [
    'ngAnimate',
    'toastr',
    'graphdb.framework.clustermanagement.controllers',
    'graphdb.framework.clustermanagement.directives'
];

const clusterManagementApp = angular.module('graphdb.framework.clustermanagement', modules);
