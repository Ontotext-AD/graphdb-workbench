define(['angular/core/services'], 
        
    function(){

		var exportDirectives = angular.module('graphdb.framework.impex.export.directives', []);
		
		exportDirectives.directive('paginations', function(){
			return {
				template: '<pagination class="nav navbar-right" total-items="matchedElements.length" items-per-page="pageSize" ng-model="page" ng-change="changePagination()" direction-links="false" boundary-links="true" max-size="5" rotate="true"></pagination>',
			    link: function ($scope) {
                    $scope.updateResults = function () {
                        $scope.matchedElements = [];
                        if(angular.isDefined($scope.graphs)){
							angular.forEach($scope.graphs, function (item) {
								if (item.contextID.value.indexOf($scope.exportFilter) !== -1) {
									$scope.matchedElements.push(item);
								}
							});
						}
						if(angular.isDefined($scope.namespaces)){
							angular.forEach($scope.namespaces, function (item) {
								if (item.namespace.indexOf($scope.searchNamespaces) !== -1 || item.prefix.indexOf($scope.searchNamespaces) !== -1) {
									$scope.matchedElements.push(item);
								}
							});
						}
                    };
                }
			}
		});
		
		exportDirectives.directive('formatDropdown', function () {
		    return {
		    	restrict: 'A',
		    	scope: {
		    		selectFormat: '&',
		    	},
				controller: function($scope, $element) {
		
				},
		        templateUrl: 'res/formatsDropdown.html',
		        replace: true
		    };
		});
		
		return exportDirectives;
});
