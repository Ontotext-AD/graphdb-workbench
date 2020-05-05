import 'angular/core/services';
import 'angular/core/directives';
import 'angular/explore/statements.service';
import 'angular/explore/controllers';
import 'angular/explore/directives';
import 'angular-xeditable/dist/js/xeditable.min';
import 'lib/angucomplete-alt/angucomplete-alt-onto.min';
import 'angular/explore/fit-text.directive';

const modules = [
    'ngRoute',
    'toastr',
    'xeditable',
    'angucomplete-alt-onto',
    'graphdb.framework.explore.services',
    'graphdb.framework.explore.controllers',
    'graphdb.framework.explore.directives',
    'graphdb.framework.explore.directives.fittext'
];

angular.module('graphdb.framework.explore', modules);
