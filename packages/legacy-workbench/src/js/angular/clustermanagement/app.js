import 'angular/core/services';
import 'angular/core/directives';
import 'angular/clustermanagement/controllers/cluster-management.controller';
import 'angular/clustermanagement/directives/cluster-graphical-view.directive';
import 'angular/clustermanagement/directives/cluster-configuration/cluster-configuration.directive';
import 'angular/clustermanagement/directives/cluster-nodes-configuration.directive';
import 'angular/core/services/repositories.service';
import 'lib/d3.patch.js';
import 'angular-pageslide-directive/dist/angular-pageslide-directive';
import 'angular/core/directives/validate-url.directive';
import 'angular/core/directives/validate-duplicate-url.directive';

const modules = [
    'ngAnimate',
    'toastr',
    'graphdb.framework.clustermanagement.controllers.cluster-management',
    'graphdb.framework.clustermanagement.directives.cluster-graphical-view',
    'graphdb.framework.clustermanagement.directives.cluster-configuration',
    'graphdb.framework.clustermanagement.directives.cluster-nodes-configuration',
    'graphdb.framework.core.directives.validate-url',
    'graphdb.framework.core.directives.validate-duplicate-url'
];

angular.module('graphdb.framework.clustermanagement', modules);
