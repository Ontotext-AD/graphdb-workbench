angular.module('wb-custom-element', [])
.directive('wb-custom-element', function() {
    return {
        restrict: 'E',
        templateUrl: '../../template.html',
        controller: 'mainCtrl'
    };
});
