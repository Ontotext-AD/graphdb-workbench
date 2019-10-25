import 'angular/core/services';
import 'angular/core/directives';
import 'lib/yasqe.bundled.min';
import 'lib/yasr.bundled';

const ontorefine = angular.module('graphdb.framework.ontorefine', ['graphdb.framework.core.directives']);

ontorefine.controller('OntoRefineCtrl', ['$scope', '$routeParams', '$window', '$location', '$timeout', function ($scope, $routeParams, $window, $location, $timeout) {
    $scope.refineDisabled = false;
    if ($routeParams.project) {
        $scope.page = 'orefine/project?project=' + $routeParams.project;
    } else if ($routeParams.page) {
        $scope.page = 'orefine/' + $routeParams.page;
    } else {

        $scope.page = 'orefine/';
    }

    window.clickFunction = function (event) {
        event.preventDefault();
        const that = this;
        $timeout(function () {
            const path = that.href.replace(/.+orefine/, 'ontorefine');
            $location.path(path);
        });
        return false;
    };

    window.loadFunction = function () {
        const iframeElement = window.document.getElementsByTagName('iframe')[0];
        if (iframeElement.contentWindow.document.head.innerHTML.indexOf('OntoRefine is disabled') > 0 ||
            iframeElement.contentWindow.document.body.innerHTML.indexOf('OntoRefine is disabled') > 0) {
            $scope.refineDisabled = true;
            $scope.$apply();
            return;
        }
        const aS = iframeElement.contentWindow.document.getElementsByTagName('a');
        for (let i = 0; i < aS.length; i++) {
            if (aS[i].target === '_parent') {
                aS[i].onclick = window.clickFunction;
            }
        }
        if (iframeElement.contentWindow.location.pathname.indexOf('/project') > -1) {
            $('h1').css('position', 'absolute');
            iframeElement.style.height = 'calc(100vh - 45px)';
        } else {
            $('h1').css('position', '');
            iframeElement.style.height = 'calc(100vh - 75px)';
        }
    };
}]);
