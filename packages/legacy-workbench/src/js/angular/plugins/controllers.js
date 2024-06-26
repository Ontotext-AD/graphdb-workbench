import 'angular/rest/plugins.rest.service';

const modules = [
    'graphdb.framework.rest.plugins.service'
];

angular
    .module('graphdb.framework.plugins.controllers', modules)
    .controller('PluginsCtrl', PluginsCtrl);

PluginsCtrl.$inject = ['$scope', '$interval', 'toastr', '$repositories', '$licenseService', '$timeout', 'PluginsRestService', '$translate'];

function PluginsCtrl($scope, $interval, toastr, $repositories, $licenseService, $timeout, PluginsRestService, $translate) {

    let timer;

    const init = function () {
        $scope.clear();
        if (!$licenseService.isLicenseValid() ||
            !$repositories.getActiveRepository() ||
            $repositories.isActiveRepoOntopType() ||
            $repositories.isActiveRepoFedXType()) {
            return;
        }
        getPlugins();
    };

    $scope.clear = function () {
        $scope.searchPluginsTerm = '';
        $scope.plugins = [];
        $scope.displayedPlugins = [];
    };

    const getPlugins = function () {
        initPlugins();
        timer = $interval(function () {
            initPlugins();
        }, 5000);
    };

    const initPlugins = function () {
        PluginsRestService.getPlugins($scope.getActiveRepository())
            .success(function (data) {
                $scope.plugins = $scope.buildPluginsArray(data.results.bindings);
            }).error(function (data) {
            toastr.error(getError(data));
        }).finally(function () {
            $scope.filterResults();
            $scope.setLoader(false);
        });
    };

    $scope.buildPluginsArray = function (plugins) {
        return plugins.map((plugin) => ({
            name: plugin.s.value,
            enabled: plugin.o.value === 'true'
        })).filter(function (plugin) {
            return plugin.name !== 'plugincontrol' && plugin.name !== 'literals-index';
        }).sort(function (a, b) {
            const textA = a.name.toLowerCase();
            const textB = b.name.toLowerCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
    };

    $scope.filterResults = function () {
        const matchedPlugins = $scope.plugins.filter((plugin) => plugin.name.indexOf($scope.searchPluginsTerm) !== -1);
        if (displayedPluginsChanged(matchedPlugins)) {
            $scope.updateDisplayedPlugins(matchedPlugins);
        }
    };

    /**
     * Checks if displayed plugins in the view are different than <code>plugins</code>.
     * @param {*} plugins - plugins to be checked.
     * @return {boolean} returns true if <code>plugins</code> are different from those which are shown in the view.
     */
    const displayedPluginsChanged = function (plugins) {
        if (!$scope.displayedPlugins || $scope.displayedPlugins.length !== plugins.length) {
            return true;
        }

        for (const plugin in plugins) {
            if (!$scope.displayedPlugins.find((element) => angular.equals(element, plugins[plugin]))) {
                return true;
            }
        }

        return false;
    };

    $scope.updateDisplayedPlugins = function (plugins) {
        $scope.displayedPlugins = plugins;
        setTimeout(function () {
            $scope.applyRowStyles();
        }, 0);
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

    // this is used when repository is changed from the upper menu to refresh the plugins for it.
    $scope.$on('repositoryIsSet', function () {
        cancelTimer();
        init();
    });

    $scope.$on('$destroy', function () {
        cancelTimer();
        $(window).off('resize.plugin');
    });

    $(window).on('resize.plugin', function () {
        $scope.applyRowStyles();
    });

    function cancelTimer() {
        if (timer) {
            $interval.cancel(timer);
        }
    }

    $scope.applyRowStyles = function () {
        const tableWidth = $('#wb-plugins-pluginInPlugins').width();
        const rowWidth = $('tr').width();
        const columnPerRow = Math.floor(tableWidth / rowWidth);
        $('.wb-plugins-row').toArray().forEach((value, index) => {
            if ($scope.isGreyBackground(columnPerRow, index)) {
                $(value).addClass('grey-row');
            } else {
                $(value).removeClass('grey-row');
            }
        });
    };

    $scope.isGreyBackground = function (columnPerRow, index) {
        const row = Math.floor(index / columnPerRow) + 1;
        const oddRow = row % 2 !== 1;
        const evenElement = index % 2 !== 0;
        const evenColumns = columnPerRow % 2 !== 0;

        if (evenColumns) {
            if (oddRow && !evenElement || !oddRow && !evenElement) {
                return true;
            }
            if (oddRow && evenElement || !oddRow && evenElement) {
                return false;
            }
        } else {
            if (oddRow && !evenElement || !oddRow && evenElement) {
                return false;
            }
            if (oddRow && evenElement || !oddRow && !evenElement) {
                return true;
            }
        }
    };

    $scope.togglePlugin = function (pluginName, enabled) {
        const repoId = $scope.getActiveRepository();
        const message = enabled ? $translate.instant('deactivating.plugin', {pluginName: pluginName}) : $translate.instant('activating.plugin', {pluginName: pluginName});
        $scope.setLoader(true, message);
        PluginsRestService.togglePlugin(repoId, enabled, pluginName)
            .error(function (data) {
            toastr.error(getError(data));
        }).finally(function () {
            initPlugins();
            $scope.setLoader(false);
        });
    };

    $scope.getLoaderMessage = function () {
        return $scope.loaderMessage || $translate.instant('common.loading');
    };

    $scope.onSearchTermChanged = function () {
        $scope.filterResults();
    };

    init();
}
