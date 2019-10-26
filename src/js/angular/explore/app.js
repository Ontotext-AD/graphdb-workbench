import 'angular/core/services';
import 'angular/core/directives';
import 'angular/explore/statements.service';
import 'angular/explore/controllers';
import 'angular/explore/directives';
import 'angular-xeditable/dist/js/xeditable.min';
import 'lib/angucomplete-alt/angucomplete-alt-onto.min';

const modules = [
    'ngRoute',
    'toastr',
    'xeditable',
    'angucomplete-alt-onto',
    'graphdb.framework.explore.services',
    'graphdb.framework.explore.controllers',
    'graphdb.framework.explore.directives'
];

angular.module('graphdb.framework.explore', modules);
