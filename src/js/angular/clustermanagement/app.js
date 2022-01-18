import 'angular/core/services';
import 'angular/core/directives';
import 'angular/clustermanagement/raft-controllers';
import 'angular/clustermanagement/raft-directives';
import 'angular/core/services/repositories.service';
import 'd3/build/d3';
import 'lib/d3-ONTO-chord-patch';

const modules = [
    'ngAnimate',
    'toastr',
    'graphdb.framework.clustermanagement.raftControllers',
    'graphdb.framework.clustermanagement.raftDirectives'
];

const clusterManagementApp = angular.module('graphdb.framework.clustermanagement', modules);
