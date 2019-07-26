
define(['angular/core/services',
        'angular/core/directives',
        'lib/yasqe.bundled.min',
        'lib/yasr.bundled'
    ],
    function(){
		var ontorefine = angular.module('graphdb.framework.ontorefine', ['graphdb.framework.core.directives']);

		var ontoRefineText = "GraphDB OntoRefine is a data transformation tool, based on OpenRefine and integrated in GraphDB Workbench, for converting tabular data into RDF and importing it into a GraphDB repository, using simple SPARQL queries and a virtual endpoint.  The supported formats are TSV, CSV, *SV, Excel (.xls and. xlsx), JSON, XML, RDF as XML, and Google sheet. Using OntoRefine you can easily filter your data, edit the inconsistencies, convert it into RDF, and import it into your repository."

		ontorefine.controller('OntoRefineCtrl', ['$scope', '$routeParams', '$window', '$location', '$timeout', function($scope, $routeParams, $window, $location, $timeout) {
		    $scope.refineDisabled = false;
		    if ($routeParams.project) {
		        $scope.page = "orefine/project?project=" + $routeParams.project;
		    } else if ($routeParams.page) {
		        $scope.page = "orefine/" + $routeParams.page;
		    } else {

		        $scope.page = "orefine/";
		    }


            window.clickFunction = function(event) {
                event.preventDefault();
                var that = this;
                $timeout(function() {
                    var t = that.href.replace(/.+orefine/, "ontorefine");
                    $location.path(t);
                });
                return false;
            }

            window.loadFunction = function() {
                var iframeElement = window.document.getElementsByTagName("iframe")[0];
                if (iframeElement.contentWindow.document.head.innerHTML.indexOf("OntoRefine is disabled") > 0 ||
                    iframeElement.contentWindow.document.body.innerHTML.indexOf("OntoRefine is disabled") > 0) {
                    $scope.refineDisabled = true;
                    $scope.$apply();
                    return;
                }
                var aS = iframeElement.contentWindow.document.getElementsByTagName("a");
                for(var i = 0; i < aS.length; i++) {
                    if (aS[i].target === "_parent") {
                        aS[i].onclick = window.clickFunction;
                    }
                }
                if (iframeElement.contentWindow.location.pathname.indexOf("/project") > -1) {
                    $('h1').css('position', 'absolute');
                    iframeElement.style.height = 'calc(100vh - 45px)';
                } else {
                    $('h1').css('position', '');
                    iframeElement.style.height = 'calc(100vh - 75px)';
                }
            }
		}]);

		ontorefine.config(['$routeProvider', '$menuItemsProvider', function ($routeProvider, $menuItemsProvider) {

		    $routeProvider.when('/ontorefine', {
		  		templateUrl : 'pages/ontorefine.html',
		  		controller : 'OntoRefineCtrl',
				title: 'OntoRefine',
                helpInfo: ontoRefineText
		  	});

		    $routeProvider.when('/ontorefine/:page', {
		  		templateUrl : 'pages/ontorefine.html',
		  		controller : 'OntoRefineCtrl',
				title: 'OntoRefine',
                helpInfo: ontoRefineText
		  	});

		    $routeProvider.when('/ontorefine/project?project=:project', {
		  		templateUrl : 'pages/ontorefine.html',
		  		controller : 'OntoRefineCtrl',
				title: 'OntoRefine',
                helpInfo: ontoRefineText
		  	});

		    $menuItemsProvider.addItem({label : 'Import', href : '#', order : 0, role: "IS_AUTHENTICATED_FULLY", icon: "icon-import"});
			$menuItemsProvider.addItem({label : 'Tabular (OntoRefine)', href : 'ontorefine', order : 2, parent : 'Import', role: "IS_AUTHENTICATED_FULLY"});
		}]);

		return ontorefine;
	}

);
