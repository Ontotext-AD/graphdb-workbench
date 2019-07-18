define(['angular/core/services'], 
        
    function(){

		return angular.module('graphdb.framework.externalsync.directives', [])
			.directive('createProgress', function(){
				return {
					templateUrl: 'pages/connectorProgress.html',
					controller: 'CreateProgressCtrl',
					restrict: 'EA'
				}
		});

});
