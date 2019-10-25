import 'angular/core/services';
import 'angular/core/directives';
import 'angular/export/controllers';
import 'angular/directives/paginations';
import 'angular/core/services/repositories.service';
import 'lib/FileSaver-patch';

const modules = [
    'ui.bootstrap',
    'toastr',
    'ngRoute',
    'ngCookies',
    'graphdb.framework.impex.export.controllers',
    'graphdb.framework.directives.paginations',
    'graphdb.framework.core.services.repositories',
    'graphdb.framework.core.directives'
];

const exportApp = angular.module('graphdb.framework.impex.export', modules);

exportApp.config(['$tooltipProvider', function ($tooltipProvider) {
    //Add custom event for Export repository DD tooltip
    $tooltipProvider.setTriggers({'showExportDDTooltip': 'showExportDDTooltip'});
}]);
