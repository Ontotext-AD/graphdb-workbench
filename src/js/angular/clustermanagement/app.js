import 'angular/core/services';
import 'angular/core/directives';
import 'angular/clustermanagement/controllers/cluster-management.controller';
import 'angular/clustermanagement/directives/cluster-graphical-view.directive';
import 'angular/core/services/repositories.service';
import 'lib/d3.patch.js';
import 'angular-pageslide-directive/dist/angular-pageslide-directive';

const modules = [
    'ngAnimate',
    'toastr',
    'graphdb.framework.clustermanagement.controllers.cluster-management',
    'graphdb.framework.clustermanagement.directives.cluster-graphical-view'
];

angular.module('graphdb.framework.clustermanagement', modules);
