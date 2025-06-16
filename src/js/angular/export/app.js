import 'angular/core/services';
import 'angular/core/directives';
import 'angular/export/controllers';
import 'angular/core/directives/paginations';
import 'angular/core/services/repositories.service';
import 'lib/FileSaver-patch';

const modules = [
    'ui.bootstrap',
    'toastr',
    'ngRoute',
    'ngCookies',
    'graphdb.framework.impex.export.controllers',
    'graphdb.framework.core.directives.paginations',
    'graphdb.framework.core.services.repositories',
    'graphdb.framework.core.directives'
];

const exportApp = angular.module('graphdb.framework.impex.export', modules);

exportApp.config(['$uibTooltipProvider', function ($uibTooltipProvider) {
    //Add custom event for Export repository DD tooltip
    $uibTooltipProvider.setTriggers({'showExportDDTooltip': 'showExportDDTooltip'});
}]);
