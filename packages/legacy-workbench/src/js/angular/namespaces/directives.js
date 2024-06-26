const namespacesDirectives = angular.module('graphdb.framework.namespaces.directives', ['ngRoute']);

// This directive will set the loader to false once the respective ngRepeat is done loading
namespacesDirectives.directive('loaderPostRepeatDirective', ['$timeout', function ($timeout) {
    return function (scope) {
        if (scope.$last) {
            // It's important to do this with timeout:
            //   "...since the setTimeout function gets pushed to the end of the queue of the browser,
            //   its always right after everything is done in angular, usually ngRepeat which continues
            //   after its parents postLinking function"
            $timeout(function () {
                scope.$parent.loader = false;
            }, 0);
        }
    };
}]);
