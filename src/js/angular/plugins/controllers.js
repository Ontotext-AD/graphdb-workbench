import 'angular/rest/plugins.rest.service';

const modules = [
    'graphdb.framework.rest.plugins.service'
];

angular
    .module('graphdb.framework.plugins.controllers', modules)
    .controller('PluginsCtrl', PluginsCtrl);

PluginsCtrl.$inject = ['$scope', '$interval', 'toastr', '$repositories', '$licenseService', '$modal', '$timeout', 'PluginsRestService', '$translate'];

function PluginsCtrl($scope, $interval, toastr, $repositories, $licenseService, $modal, $timeout, PluginsRestService, $translate) {

    $scope.setPluginIsActive = function (isPluginActive) {
        $scope.pluginIsActive = isPluginActive;
    };
    const getPlugins = function () {
        PluginsRestService.getPlugins($scope.getActiveRepository())
            .success(function (data) {
                $scope.plugins = $scope.buildPluginsArray(data.results.bindings);
                if (angular.isDefined($scope.plugins)) {
                    $scope.displayedPlugins = $scope.plugins;
                }
                $scope.matchedElements = $scope.plugins;
            }).error(function (data) {
            toastr.error(getError(data));
        }).finally(function () {
            $scope.setLoader(false);
        });
    };

    const init = function () {
        if (!$licenseService.isLicenseValid() ||
            !$repositories.getActiveRepository() ||
            $repositories.isActiveRepoOntopType() ||
            $repositories.isActiveRepoFedXType()) {
            return;
        }
        $scope.searchPlugins = '';
        getPlugins();
    };

    $scope.buildPluginsArray = function (plugins) {
        return plugins.map((plugin) => ({
            name: plugin.s.value,
            enabled: plugin.o.value === 'true'
        })).filter(function (plugin) {
            return plugin.name !== 'plugincontrol';
        }).sort(function (a, b) {
            const textA = a.name.toLowerCase();
            const textB = b.name.toLowerCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
    };

    $scope.togglePlugin = function (pluginName, enabled) {
        const repoId = $scope.getActiveRepository();
        $scope.setLoader(true, enabled ? $translate.instant('deactivating.plugin', {pluginName: pluginName}) : $translate.instant('activating.plugin', {pluginName: pluginName}));
        PluginsRestService.togglePlugin(repoId, enabled, pluginName).success(function () {
            getPlugins();
        }).error(function (data) {
            toastr.error(getError(data));
        }).finally(function () {
            $scope.setLoader(false);
        });
    };

    // this is used when repository is changed from the upper menu to refresh the plugins for it.
    $scope.$on('repositoryIsSet', function () {
        if (!$licenseService.isLicenseValid() ||
            !$repositories.getActiveRepository() ||
            $repositories.isActiveRepoOntopType() ||
            $repositories.isActiveRepoFedXType()) {
            return;
        }
        $scope.searchPlugins = '';
        getPlugins();
    });

    $scope.getLoaderMessage = function () {
        return $scope.loaderMessage || $translate.instant('common.loading');
    };

    $scope.setLoader = function (loader, message) {
        $timeout.cancel($scope.loaderTimeout);
        if (loader) {
            $scope.loaderTimeout = $timeout(function () {
                $scope.loader = loader;
                $scope.loaderMessage = message;
            }, 300);
        } else {
            $scope.loader = false;
        }
    };

    $scope.filterResults = function () {
        angular.forEach($scope.plugins, function (item) {
            if (item.name.indexOf($scope.searchPlugins) !== -1) {
                $scope.matchedElements.push(item);
            }
        });
    };

    $scope.onPluginsSearch = function () {
        $scope.matchedElements = [];
        $scope.filterResults();
    };

    //for searchbox
    $scope.$watch('matchedElements', function () {
        if (angular.isDefined($scope.matchedElements)) {
            $scope.displayedPlugins = $scope.matchedElements;
        }
    });

    init();
}
