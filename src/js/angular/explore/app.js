import 'angular/core/services';
import 'angular/core/directives';
import 'angular/explore/statements.service';
import 'angular/explore/controllers';
import 'angular/explore/directives';
import 'angular-xeditable/dist/js/xeditable.min';
import 'lib/angucomplete-alt/angucomplete-alt-onto.min';
import 'angular/core/directives/fit-text.directive';
import 'angular/core/directives/yasgui-component/yasgui-component.directive';

const modules = [
    'ngRoute',
    'toastr',
    'xeditable',
    'angucomplete-alt-onto',
    'graphdb.framework.explore.services',
    'graphdb.framework.explore.controllers',
    'graphdb.framework.explore.directives',
    'graphdb.framework.core.directives.fittext',
    'graphdb.framework.core.directives.yasgui-component'
];

angular.module('graphdb.framework.explore', modules);
