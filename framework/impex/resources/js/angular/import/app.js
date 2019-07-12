
define(['angular/core/services',
        'angular/core/directives',
        'angular/import/controllers',
        'angular/import/directives',
        'angular/repositories/services',
        'ng-file-upload.min',
        'ng-file-upload-shim.min'],

    function () {

	var importApp = angular.module(
				'graphdb.framework.impex.import',
				['toastr',
				 'ngRoute',
				 'ngFileUpload',
				 'ui.bootstrap',
				 'graphdb.framework.impex.import.directives',
				 'graphdb.framework.impex.import.controllers',
				 'graphdb.framework.repositories.services',
				 'graphdb.framework.core.directives']);

		importApp.config(['$routeProvider', '$menuItemsProvider', function($routeProvider, $menuItemsProvider) {
		   	$routeProvider.when('/import', {
		   	    reloadOnSearch : false,
		  		templateUrl : 'pages/import.html',
		  		controller : 'CommonCtrl',
				title: 'Import',
				helpInfo: 'The Import view allows you to import RDF data into GraphDB. '
				+ 'Import data from local files, from files on the server where the workbench is located, '
				+ 'from a remote URL (with a format extension or by specifying the data format), '
        + 'or by pasting the RDF data in the Text area tab. '
				+ 'Each import method supports different serialisation formats.'
		  	})

			$menuItemsProvider.addItem({label : 'Import', href : '#', order : 0, role : 'IS_AUTHENTICATED_FULLY', icon: "icon-import"});
            $menuItemsProvider.addItem({label : 'RDF', href : 'import', order : 1, parent : 'Import', role : 'IS_AUTHENTICATED_FULLY'});
		}])

		return importApp;
});
