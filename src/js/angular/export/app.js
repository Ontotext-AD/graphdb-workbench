
define(['angular/core/services',
        'angular/core/directives',
        'angular/export/controllers',
        'angular/export/directives',
        'angular/repositories/services',
		'lib/FileSaver-patch'],
    function(){

		var exportApp = angular.module(
				'graphdb.framework.impex.export',
				['ui.bootstrap',
				 'toastr',
				 'ngRoute',
				 'ngCookies',
				 'graphdb.framework.impex.export.controllers',
				 'graphdb.framework.impex.export.directives',
				 'graphdb.framework.repositories.services',
				 'graphdb.framework.core.directives']);

		exportApp.config(['$menuItemsProvider', '$routeProvider', '$tooltipProvider', function ($menuItemsProvider, $routeProvider, $tooltipProvider) {



		   	$routeProvider.when('/graphs', {
		  		templateUrl : 'pages/export.html',
		  		controller : 'ExportCtrl',
				title: 'Graphs overview',
				helpInfo: 'Graphs overview provides a list of the default graph and all named graphs in GraphDB. '
				            + 'It can be used to inspect the statements in each graph, export the graph or clear the graph\'s data. '
		  	});

            $menuItemsProvider.addItem({
                label : 'Explore',
                href : '#',
                order : 1,
                role : 'IS_AUTHENTICATED_FULLY',
                icon: "icon-data"
            });

			$menuItemsProvider.addItem({label : 'Graphs overview', href : 'graphs', order : 0, role: "IS_AUTHENTICATED_FULLY", parent: "Explore"});


		    //Add custom event for Export repository DD tooltip
		    $tooltipProvider.setTriggers({'showExportDDTooltip': 'showExportDDTooltip'});

		}]);

		return exportApp;

	});
