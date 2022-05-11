import 'angular/core/services';
import 'angular/core/directives';
import 'angular/clustermanagement/controllers';
import 'angular/clustermanagement/directives';
import 'angular/core/services/repositories.service';
import 'd3/build/d3';
import 'lib/d3-ONTO-chord-patch';
import 'angular-pageslide-directive/dist/angular-pageslide-directive';

const modules = [
    'ngAnimate',
    'toastr',
    'graphdb.framework.clustermanagement.controllers',
    'graphdb.framework.clustermanagement.directives'
];

const clusterManagementApp = angular.module('graphdb.framework.clustermanagement', modules);
